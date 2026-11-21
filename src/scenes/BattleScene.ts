import Phaser from "phaser";
import { anchor, playEntrance, playSendIn, playAttack, playBuff, playHit, playFaint, playTamed, playWobble } from "@/gfx/spriteAnim";
import { drawPanel, drawHpBar } from "@/gfx/panel";
import { recordBoss, recordDefeat, recordTame } from "@/systems/quests";
import { BOSSES, bossFlag, type BossDef } from "@/data/bosses";
import { EQUIPMENT, canEquip, classOf, goldReward, rollGearDrop } from "@/data/equipment";
import { makeBoss, makeBattleCreature, gainExp, SPECIES, type BattleCreature, type StatusCondition } from "@/data/creatures";
import { MOVES, type MoveDef } from "@/data/moves";
import { getTotalEffect } from "@/data/typeChart";
import { ITEMS } from "@/data/items";
import { MAX_PARTY_SIZE, blackout, setFlag, addGold, addToInventory, getParty, setParty, getInventory, setInventory } from "@/systems/playerState";
import { autosave } from "@/systems/saveLoad";
import type { WorldScene } from "@/scenes/WorldScene";
import { centerFixedLayout, attachFpsOverlay, SPRITE_SCALE } from "@/config";

// ── Layout ────────────────────────────────────────────────────────────────────
const W = 480, H = 320;
const BG_W = 2400; // backdrop strips are drawn far wider than W so wide screens have no empty sides
const FIELD_H = 178;
const UI_Y    = FIELD_H;
const SKY_H   = 108;

const WILD_X = 370, WILD_Y = 118; // keeps the 64px sprite clear of the player HP panel (top y=126)
const PLYR_X =  90, PLYR_Y = 170;
const HP_BAR_W = 155, HP_BAR_H = 8;
// HP bar top-left corners (the wild panel sits at 8,8 and the player's at 216,126; the bar is 26px in, 30px down, centred)
const WILD_BAR_X = 8 + 26,   WILD_BAR_Y = 8 + 30 - HP_BAR_H / 2;
const PC_BAR_X   = 216 + 26, PC_BAR_Y   = 126 + 30 - HP_BAR_H / 2;

const BTN_W = 234, BTN_H = 30;
const BTN_ROWS = [UI_Y + 66, UI_Y + 100];
const BTN_COLS = [4, 242];

/** Sky / ground / horizon line / shadow colours per zone. */
const BATTLE_BACKDROPS: Record<string, { sky: number; ground: number; horizon: number; shadow: number }> = {
  overworld: { sky: 0x87ceeb, ground: 0x5a8e3a, horizon: 0x3a6a1a, shadow: 0x336633 },
  cave:      { sky: 0x1c1228, ground: 0x3a2a2a, horizon: 0x2a1a3a, shadow: 0x2a1a2a },
  forest:    { sky: 0x3d6a4a, ground: 0x2e5a2e, horizon: 0x1e4a1e, shadow: 0x1a3a1a },
  plains:    { sky: 0xa8d8f0, ground: 0xa89848, horizon: 0x8a7a30, shadow: 0x7a6a28 },
};

export interface BattleInitData {
  wildSpeciesId: number;
  wildLevel: number;
  /** Set for boss fights: no fleeing or taming, scaled stats, enrage phase. */
  bossId?: string;
  zoneId: string;
}

type BattleState = "menu" | "move-select" | "item-select" | "party-select" | "party-select-forced";

interface DamageResult { damage: number; effectiveness: number; isCrit: boolean }

/** One slot in the generic 2x2 selectable button grid (moves / items / party). */
interface GridEntry {
  label: string;
  sublabel: string;
  enabled: boolean;
  typeColor?: number;
}

// Status-condition moves this build actually wires up - the rest of the
// "status" category (growl, tail_whip, defense_curl, teleport, splash, ...)
// are stat-stage/utility moves with no StatusCondition equivalent, so they're
// left as flavor-only ("used X!" with no further effect) rather than building
// a whole separate stat-stage system for this pass.
const STATUS_MOVE_EFFECTS: Partial<Record<string, StatusCondition>> = {
  thunder_wave: "paralysis",
  poison_powder: "poison",
  hypnosis: "sleep",
};

const STATUS_APPLIED_MSG: Record<StatusCondition, (name: string) => string> = {
  paralysis: (n) => `${n} was paralyzed! It may be unable to move!`,
  poison:    (n) => `${n} was poisoned!`,
  sleep:     (n) => `${n} fell asleep!`,
  burn:      (n) => `${n} was burned!`,
  freeze:    (n) => `${n} was frozen solid!`,
};

export class BattleScene extends Phaser.Scene {
  private battleInit!: BattleInitData;
  private wild!: BattleCreature;
  private boss?: BossDef;
  private enraged = false;

  private party!: BattleCreature[];
  private activeIndex = 0;
  private get pc(): BattleCreature { return this.party[this.activeIndex]; }

  private itemIds: string[] = []; // in-stock item ids backing the current item-select grid

  private wildSprite!: Phaser.GameObjects.Image;
  private pcSprite!: Phaser.GameObjects.Image;

  private wildHpFill!: Phaser.GameObjects.Graphics;
  private pcHpFill!: Phaser.GameObjects.Graphics;
  private pcHpText!: Phaser.GameObjects.Text;
  private pcNameText!: Phaser.GameObjects.Text;
  private pcLevelText!: Phaser.GameObjects.Text;

  private msgText!: Phaser.GameObjects.Text;
  private btnGfx!: Phaser.GameObjects.Graphics;
  private backBtn!: Phaser.GameObjects.Rectangle;
  private backLabel!: Phaser.GameObjects.Text;
  private btnLabels: Phaser.GameObjects.Text[] = [];

  // Generic 2x2 selectable grid, reused for move-select / item-select / party-select.
  private gridGfx!: Phaser.GameObjects.Graphics;
  private gridLabels: Phaser.GameObjects.Text[] = [];
  private gridSubLabels: Phaser.GameObjects.Text[] = [];
  private gridEntries: GridEntry[] = [];
  private onGridConfirm: ((index: number) => void) | null = null;
  private onGridCancel: (() => void) | null = null;

  private state: BattleState = "menu";
  private cursor = 0;

  private msgCallback: (() => void) | null = null;
  private msgWaiting = false;

  private zKey!: Phaser.Input.Keyboard.Key;
  private xKey!: Phaser.Input.Keyboard.Key;
  private upKey!: Phaser.Input.Keyboard.Key;
  private downKey!: Phaser.Input.Keyboard.Key;
  private leftKey!: Phaser.Input.Keyboard.Key;
  private rightKey!: Phaser.Input.Keyboard.Key;

  constructor() { super({ key: "BattleScene" }); }

  init(d: BattleInitData) { this.battleInit = d; }

  create() {
    // See handleShutdown() for why this registration (not just a same-named
    // method) is required - re-registered each battle since create() re-runs
    // on the same reused Scene instance each time, but this listener only fires once.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);

    const { wildSpeciesId, wildLevel, zoneId, bossId } = this.battleInit;
    this.boss = bossId ? BOSSES[bossId] : undefined;
    this.enraged = false;
    this.wild = this.boss ? makeBoss(this.boss) : makeBattleCreature(wildSpeciesId, wildLevel);

    this.party = getParty(this.game);
    if (this.party.length === 0) {
      // Safety fallback only - StarterScene always seeds the party on confirm.
      const starterSpeciesId = (this.game.registry.get("starterSpeciesId") as number | undefined) ?? 7;
      this.party = [makeBattleCreature(starterSpeciesId, 5)];
    }
    this.activeIndex = Math.max(0, this.party.findIndex(c => c.currentHp > 0));

    centerFixedLayout(this, 0x090916);
    const bg = BATTLE_BACKDROPS[zoneId] ?? BATTLE_BACKDROPS.overworld;
    const { sky: skyCol, ground: gndCol, horizon: hrzCol, shadow: shdCol } = bg;

    // Background
    this.add.rectangle(W / 2, SKY_H / 2,              BG_W, SKY_H,           skyCol);
    this.add.rectangle(W / 2, SKY_H + (FIELD_H - SKY_H) / 2, BG_W, FIELD_H - SKY_H, gndCol);
    this.add.rectangle(W / 2, SKY_H, BG_W, 2, hrzCol);
    this.add.ellipse(WILD_X, WILD_Y + 2, 56, 10, shdCol, 0.55);
    this.add.ellipse(PLYR_X, PLYR_Y + 2, 56, 10, shdCol, 0.55);

    // Battle sprites
    this.wildSprite = this.add
      .image(WILD_X, WILD_Y, `creature-front-${wildSpeciesId}`)
      .setOrigin(0.5, 1).setScale(SPRITE_SCALE);
    this.pcSprite = this.add
      .image(PLYR_X, PLYR_Y, `creature-back-${this.pc.speciesId}`)
      .setOrigin(0.5, 1).setScale(SPRITE_SCALE);
    if (this.boss) this.wildSprite.setScale(1.15 * SPRITE_SCALE); // bosses show a little larger than regular monsters
    anchor(this.wildSprite);
    anchor(this.pcSprite);
    playEntrance(this, this.wildSprite, 1);
    playEntrance(this, this.pcSprite, -1);

    // HP panels
    this.buildWildHpPanel();
    this.buildPcHpPanel();

    // Divider + bottom BG
    this.add.rectangle(W / 2, FIELD_H, BG_W, 2, 0x000000).setOrigin(0.5, 0);
    this.add.rectangle(W / 2, UI_Y + (H - UI_Y) / 2, BG_W, H - UI_Y, 0x090916);
    attachFpsOverlay(this);

    // Message text
    this.msgText = this.add.text(12, UI_Y + 8, "", {
      fontSize: "12px", color: "#e8eeff", fontFamily: "monospace",
      wordWrap: { width: W - 24 },
    });

    // Action buttons
    this.btnGfx = this.add.graphics();
    const ACTION_LABELS = ["FIGHT", "PACK", "PARTY", "FLEE"];
    for (let i = 0; i < 4; i++) {
      const r = Math.floor(i / 2), c = i % 2;
      this.btnLabels.push(
        this.add.text(BTN_COLS[c] + BTN_W / 2, BTN_ROWS[r] + BTN_H / 2, ACTION_LABELS[i], {
          fontSize: "11px", color: "#e8eeff", fontFamily: "monospace",
        }).setOrigin(0.5),
      );
    }

    // BACK button for touch players (shown only while a grid with a cancel action is up)
    this.backBtn = this.add.rectangle(W - 44, UI_Y + 18, 80, 24, 0x0d1a3a)
      .setStrokeStyle(1.5, 0x4488ff).setVisible(false);
    this.backLabel = this.add.text(W - 44, UI_Y + 18, "BACK", {
      fontSize: "11px", color: "#aaccff", fontFamily: "monospace",
    }).setOrigin(0.5).setVisible(false);

    // Generic grid (move / item / party select)
    this.gridGfx = this.add.graphics();
    for (let i = 0; i < 4; i++) {
      const r = Math.floor(i / 2), c = i % 2;
      this.gridLabels.push(
        this.add.text(BTN_COLS[c] + 10, BTN_ROWS[r] + BTN_H / 2 - 5, "", {
          fontSize: "10px", color: "#e8eeff", fontFamily: "monospace",
        }),
      );
      this.gridSubLabels.push(
        this.add.text(BTN_COLS[c] + BTN_W - 6, BTN_ROWS[r] + BTN_H / 2 + 5, "", {
          fontSize: "9px", color: "#aabbcc", fontFamily: "monospace",
        }).setOrigin(1, 0.5),
      );
    }
    this.hideGrid();

    // Input
    const KC = Phaser.Input.Keyboard.KeyCodes;
    this.zKey    = this.input.keyboard!.addKey(KC.Z);
    this.xKey    = this.input.keyboard!.addKey(KC.X);
    this.upKey   = this.input.keyboard!.addKey(KC.UP);
    this.downKey = this.input.keyboard!.addKey(KC.DOWN);
    this.leftKey  = this.input.keyboard!.addKey(KC.LEFT);
    this.rightKey = this.input.keyboard!.addKey(KC.RIGHT);
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => this.handleTap(p));

    // Intro
    this.hideActionButtons();
    this.showMsg(this.boss ? this.boss.intro : `A wild ${this.wild.name} lunges at you!`, () =>
      this.showMsg(`Forward, ${this.pc.name}!`, () => this.enterMenu()),
    );
  }

  update() {
    const JD = Phaser.Input.Keyboard.JustDown;
    if (this.msgWaiting) { if (JD(this.zKey)) this.advanceMsg(); return; }
    if (this.state === "menu") this.handleMenuInput();
    else this.handleGridInput(); // move-select / item-select / party-select(-forced)
  }

  // ── Touch input ───────────────────────────────────────────────────────────

  /**
   * Single entry point for taps, routed exactly like update() routes the keyboard:
   * a waiting message advances, otherwise the tap picks a button of the action menu or
   * of the current grid (the cell is highlighted, then confirmed), or hits BACK.
   */
  private handleTap(p: Phaser.Input.Pointer) {
    if (this.msgWaiting) { this.advanceMsg(); return; }
    const pt = this.cameras.main.getWorldPoint(p.x, p.y);
    const cell = this.cellAt(pt.x, pt.y);

    if (this.state === "menu") {
      if (this.btnGfx.visible && cell >= 0) {
        this.cursor = cell;
        this.redrawActionButtons();
        this.confirmMenu();
      }
      return;
    }
    if (!this.gridGfx.visible) return;
    if (this.onGridCancel && this.backBtn.visible && this.backBtn.getBounds().contains(pt.x, pt.y)) {
      this.onGridCancel();
      return;
    }
    if (cell >= 0) {
      this.cursor = cell;
      this.redrawGrid();
      this.onGridConfirm?.(cell);
    }
  }

  /** Index (0-3) of the 2x2 button cell under scene point (x, y), or -1. */
  private cellAt(x: number, y: number): number {
    for (let i = 0; i < 4; i++) {
      const bx = BTN_COLS[i % 2], by = BTN_ROWS[Math.floor(i / 2)];
      if (x >= bx && x <= bx + BTN_W && y >= by && y <= by + BTN_H) return i;
    }
    return -1;
  }

  // ── Message system ────────────────────────────────────────────────────────

  private showMsg(text: string, onDone?: () => void) {
    this.msgText.setText(text);
    this.msgCallback = onDone ?? null;
    this.msgWaiting = true;
  }

  private advanceMsg() {
    this.msgWaiting = false;
    const cb = this.msgCallback;
    this.msgCallback = null;
    cb?.();
  }

  /** Shows a sequence of messages one at a time (e.g. level-up + learned-move lines). */
  private showSequential(msgs: string[], onDone: () => void) {
    if (!msgs.length) { onDone(); return; }
    const [first, ...rest] = msgs;
    this.showMsg(first, () => this.showSequential(rest, onDone));
  }

  // ── Menu ──────────────────────────────────────────────────────────────────

  private enterMenu() {
    this.state = "menu";
    this.cursor = 0;
    this.msgText.setText("What will you do?");
    this.showActionButtons();
    this.hideGrid();
  }

  private handleMenuInput() {
    const JD = Phaser.Input.Keyboard.JustDown;
    if (JD(this.leftKey) || JD(this.rightKey)) { this.cursor ^= 1; this.redrawActionButtons(); }
    if (JD(this.upKey)   || JD(this.downKey))  { this.cursor ^= 2; this.redrawActionButtons(); }
    if (JD(this.zKey)) this.confirmMenu();
  }

  private confirmMenu() {
    switch (this.cursor) {
      case 0: this.enterMoveSelect(); break;
      case 1: this.enterItemSelect(); break;
      case 2: this.enterPartySelect(false); break;
      case 3:
        this.hideActionButtons();
        if (this.boss) { this.showMsg(`There is no escape from the ${this.wild.name}!`, () => this.enterMenu()); break; }
        this.showMsg("Got away safely!", () => this.exitBattle());
        break;
    }
  }

  // ── Generic grid (move / item / party select) ────────────────────────────

  private showGrid(entries: GridEntry[], onConfirm: (index: number) => void, onCancel: (() => void) | null) {
    this.gridEntries = entries;
    this.onGridConfirm = onConfirm;
    this.onGridCancel = onCancel;
    this.gridGfx.setVisible(true);
    this.backBtn.setVisible(!!onCancel);
    this.backLabel.setVisible(!!onCancel);
    for (let i = 0; i < 4; i++) {
      const e = entries[i];
      this.gridLabels[i].setText(e?.label ?? "—").setVisible(true);
      this.gridSubLabels[i].setText(e?.sublabel ?? "").setVisible(true);
    }
    this.redrawGrid();
  }

  private hideGrid() {
    this.gridGfx.clear().setVisible(false);
    this.backBtn.setVisible(false);
    this.backLabel.setVisible(false);
    this.gridLabels.forEach(l => l.setVisible(false));
    this.gridSubLabels.forEach(l => l.setVisible(false));
  }

  private redrawGrid() {
    this.gridGfx.clear();
    for (let i = 0; i < 4; i++) {
      const r = Math.floor(i / 2), c = i % 2;
      const [x, y] = [BTN_COLS[c], BTN_ROWS[r]];
      const sel = i === this.cursor;
      const entry = this.gridEntries[i];
      const enabled = entry?.enabled ?? false;
      drawPanel(this.gridGfx, x, y, BTN_W, BTN_H, {
        cut: 2, borderWidth: 1.5, shadow: false, fillAlpha: 1,
        fill: sel ? 0x1a3a7a : (enabled ? 0x0d1a3a : 0x0a0a1a),
        border: sel ? 0x5a98ff : (enabled ? 0x233a80 : 0x1a1a28),
      });
      if (entry?.typeColor !== undefined) {
        this.gridGfx.fillStyle(entry.typeColor);
        this.gridGfx.fillRect(x + BTN_W - 14, y + 5, 8, 8);
      }
    }
  }

  private handleGridInput() {
    const JD = Phaser.Input.Keyboard.JustDown;
    if (JD(this.leftKey) || JD(this.rightKey)) { this.cursor ^= 1; this.redrawGrid(); }
    if (JD(this.upKey)   || JD(this.downKey))  { this.cursor ^= 2; this.redrawGrid(); }
    if (JD(this.xKey) && this.onGridCancel) { this.onGridCancel(); return; }
    if (JD(this.zKey)) this.onGridConfirm?.(this.cursor);
  }

  // ── Move select ───────────────────────────────────────────────────────────

  private enterMoveSelect() {
    this.state = "move-select";
    this.cursor = 0;
    this.msgText.setText("Choose a move:");
    this.hideActionButtons();
    const entries: GridEntry[] = this.pc.moves.map(slot => {
      const mv = MOVES[slot.moveId];
      return {
        label: mv?.name ?? slot.moveId,
        sublabel: `PP ${slot.pp}/${slot.maxPp}`,
        enabled: slot.pp > 0,
        typeColor: mv ? (TYPE_CHIP[mv.type] ?? 0x888888) : undefined,
      };
    });
    this.showGrid(entries, (i) => this.chooseMove(i), () => this.enterMenu());
  }

  private chooseMove(i: number) {
    const slot = this.pc.moves[i];
    if (!slot || slot.pp === 0) {
      this.showMsg("No PP left for that move!", () => { this.state = "move-select"; });
      return;
    }
    this.hideGrid();
    this.executeTurn(i);
  }

  // ── Item select ───────────────────────────────────────────────────────────

  private enterItemSelect() {
    this.state = "item-select";
    this.cursor = 0;
    this.msgText.setText("Use which item?");
    this.hideActionButtons();
    const inv = getInventory(this.game);
    this.itemIds = Object.keys(ITEMS).filter(id => (inv[id] ?? 0) > 0);
    const entries: GridEntry[] = this.itemIds.map(id => ({
      label: ITEMS[id].name,
      sublabel: `x${inv[id]}`,
      enabled: true,
    }));
    this.showGrid(entries, (i) => this.chooseItem(i), () => this.enterMenu());
  }

  private chooseItem(i: number) {
    const id = this.itemIds[i];
    if (!id) return;
    const item = ITEMS[id];

    if (item.kind === "capture") {
      if (this.boss) {
        this.showMsg(`The ${this.wild.name} cannot be tamed!`, () => { this.state = "item-select"; });
        return;
      }
      this.hideGrid();
      this.consumeItem(id);
      this.doBallThrow();
      return;
    }

    // kind === "heal"
    if (this.pc.currentHp >= this.pc.maxHp) {
      this.showMsg(`${this.pc.name} is already at full HP!`, () => { this.state = "item-select"; });
      return;
    }
    this.hideGrid();
    this.consumeItem(id);
    this.pc.currentHp = Math.min(this.pc.maxHp, this.pc.currentHp + (item.healAmount ?? 0));
    this.refreshPcHpPanel();
    this.showMsg(`${this.pc.name} drinks the draught and recovers!`, () => this.enterMenu());
  }

  private consumeItem(id: string) {
    const inv = getInventory(this.game);
    inv[id] = Math.max(0, (inv[id] ?? 0) - 1);
    setInventory(this.game, inv);
  }

  // ── Party select ──────────────────────────────────────────────────────────

  /** [forced]: true when the active creature just fainted and a switch is mandatory (no cancel). */
  private enterPartySelect(forced: boolean) {
    this.state = forced ? "party-select-forced" : "party-select";
    this.cursor = 0;
    this.msgText.setText(forced ? "Choose your next fighter:" : "Who will fight?");
    this.hideActionButtons();
    const entries: GridEntry[] = this.party.map((c, i) => ({
      label: c.name,
      sublabel: `Lv.${c.level} HP ${c.currentHp}/${c.maxHp}`,
      enabled: c.currentHp > 0 && i !== this.activeIndex,
    }));
    this.showGrid(entries, (i) => this.choosePartyMember(i, forced), forced ? null : () => this.enterMenu());
  }

  private choosePartyMember(i: number, forced: boolean) {
    const target = this.party[i];
    if (!target || target.currentHp <= 0 || i === this.activeIndex) {
      if (!forced) this.showMsg("Can't send in that fighter!", () => { this.state = "party-select"; });
      return;
    }
    this.hideGrid();
    this.activeIndex = i;
    this.pcSprite.setTexture(`creature-back-${this.pc.speciesId}`);
    playSendIn(this, this.pcSprite);
    this.refreshPcHpPanel();
    // Switching (forced or voluntary) always ends the current action and
    // returns to the main menu - a voluntary switch doesn't cost a free
    // enemy attack in this build, a deliberate simplification.
    this.showMsg(`Forward, ${this.pc.name}!`, () => this.enterMenu());
  }

  // ── Turn execution ────────────────────────────────────────────────────────

  private executeTurn(playerMoveIdx: number) {
    const pSlot = this.pc.moves[playerMoveIdx];
    const eSlot = this.pickEnemyMove();
    pSlot.pp = Math.max(0, pSlot.pp - 1);

    const pPrio = MOVES[pSlot.moveId]?.priority ?? 0;
    const ePrio = MOVES[eSlot.moveId]?.priority ?? 0;
    const playerFirst = pPrio > ePrio || (pPrio === ePrio && this.pc.speed >= this.wild.speed);

    const doPlayerAction = (next: () => void) =>
      this.takeTurn(this.pc, this.wild, this.wildSprite, pSlot.moveId, () => {
        this.updateWildHp();
        if (this.wild.currentHp <= 0) { this.onWildFaint(); return; }
        this.checkEnrage(next);
      });

    const doEnemyAction = (next: () => void) =>
      this.takeTurn(this.wild, this.pc, this.pcSprite, eSlot.moveId, () => {
        this.refreshPcHpPanel();
        if (this.pc.currentHp <= 0) { this.onPcFaint(); return; }
        next();
      });

    if (playerFirst) doPlayerAction(() => doEnemyAction(() => this.endOfTurn()));
    else              doEnemyAction(() => doPlayerAction(() => this.endOfTurn()));
  }

  /** Wild monsters pick at random; bosses usually pick their best-scoring damaging move. */
  private pickEnemyMove() {
    const moves = this.wild.moves;
    if (this.boss && Math.random() < 0.65) {
      const score = (id: string) => {
        const m = MOVES[id];
        if (!m || m.power === 0) return 0;
        return m.power * getTotalEffect(m.type, this.pc.types) * (this.wild.types.includes(m.type) ? 1.5 : 1);
      };
      return moves.reduce((best, s) => (score(s.moveId) > score(best.moveId) ? s : best), moves[0]);
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  /** Boss phase change: once worn down it flares up and hits harder for the rest of the fight. */
  private checkEnrage(next: () => void) {
    const boss = this.boss;
    if (!boss || this.enraged || this.wild.currentHp > this.wild.maxHp * boss.enrageAt) { next(); return; }
    this.enraged = true;
    this.wild.atk = Math.round(this.wild.atk * boss.enrageMult);
    this.wild.spAtk = Math.round(this.wild.spAtk * boss.enrageMult);
    playBuff(this, this.wildSprite, 0xff3030, () => this.showMsg(boss.enrageMsg, next));
  }

  /** Applies sleep/freeze/paralysis action-prevention before handing off to doAttack(). */
  private takeTurn(
    attacker: BattleCreature, defender: BattleCreature,
    defSprite: Phaser.GameObjects.Image, moveId: string, onDone: () => void,
  ) {
    if (attacker.currentHp <= 0) { onDone(); return; } // fainted earlier this same turn

    if (attacker.status === "sleep") {
      if (Math.random() < 0.33) {
        attacker.status = null;
        this.showMsg(`${attacker.name} woke up!`, () => this.doAttack(attacker, defender, defSprite, moveId, onDone));
      } else {
        this.showMsg(`${attacker.name} is fast asleep.`, onDone);
      }
      return;
    }
    if (attacker.status === "freeze") {
      if (Math.random() < 0.2) {
        attacker.status = null;
        this.showMsg(`${attacker.name} thawed out!`, () => this.doAttack(attacker, defender, defSprite, moveId, onDone));
      } else {
        this.showMsg(`${attacker.name} is frozen solid!`, onDone);
      }
      return;
    }
    if (attacker.status === "paralysis" && Math.random() < 0.25) {
      this.showMsg(`${attacker.name} is fully paralyzed!`, onDone);
      return;
    }
    this.doAttack(attacker, defender, defSprite, moveId, onDone);
  }

  private doAttack(
    attacker: BattleCreature, defender: BattleCreature,
    defSprite: Phaser.GameObjects.Image,
    moveId: string, onDone: () => void,
  ) {
    const move = MOVES[moveId];
    if (!move) { onDone(); return; }

    const atkSprite = defSprite === this.wildSprite ? this.pcSprite : this.wildSprite;
    const dir: -1 | 1 = defSprite === this.wildSprite ? 1 : -1; // direction from attacker toward defender
    const color = TYPE_CHIP[move.type] ?? 0xffffff;

    this.showMsg(`${attacker.name} used ${move.name}!`, () => {
      if (move.category === "status") {
        playBuff(this, atkSprite, color, () => this.resolveStatusMove(move, defender, onDone));
        return;
      }
      const res = this.calcDamage(attacker, defender, moveId);
      defender.currentHp = Math.max(0, defender.currentHp - res.damage);
      const style = move.category === "physical" ? "melee" : "cast";
      // The hit animation is kicked off at impact; the turn continues once both
      // the attacker has settled and the defender's recoil has finished.
      let pending = 2;
      const join = () => {
        if (--pending > 0) return;
        if (res.isCrit) this.showMsg("A critical hit!", () => this.showEffMsg(res.effectiveness, onDone));
        else            this.showEffMsg(res.effectiveness, onDone);
      };
      playAttack(this, atkSprite, { dir, style, color, target: defSprite }, () => {
        playHit(this, defSprite, dir, join);
      }, join);
    });
  }

  private resolveStatusMove(move: MoveDef, defender: BattleCreature, onDone: () => void) {
    const cond = STATUS_MOVE_EFFECTS[move.id];
    if (!cond) { onDone(); return; } // flavor-only move (growl, tail_whip, teleport, ...)
    if (defender.status) { this.showMsg("But it failed!", onDone); return; }
    if (Math.random() * 100 > move.accuracy) { this.showMsg("But it missed!", onDone); return; }
    defender.status = cond;
    this.showMsg(STATUS_APPLIED_MSG[cond](defender.name), onDone);
  }

  private showEffMsg(eff: number, onDone: () => void) {
    if (eff === 0)       this.showMsg("It had no effect!", onDone);
    else if (eff >= 2)   this.showMsg("It's super effective!", onDone);
    else if (eff <= 0.5) this.showMsg("It's not very effective...", onDone);
    else                 onDone();
  }

  private calcDamage(atk: BattleCreature, def: BattleCreature, moveId: string): DamageResult {
    const move = MOVES[moveId];
    if (!move || move.power === 0) return { damage: 0, effectiveness: 1, isCrit: false };

    const atkStat = move.category === "physical" ? atk.atk  : atk.spAtk;
    const defStat = move.category === "physical" ? def.def  : def.spDef;
    const base    = Math.floor(Math.floor((2 * atk.level / 5 + 2) * move.power * atkStat / defStat / 50) + 2);
    const stab    = atk.types.includes(move.type) ? 1.5 : 1;
    const typeEff = getTotalEffect(move.type, def.types);
    const isCrit  = Math.random() < 0.0625;
    const rnd     = (Math.floor(Math.random() * 16) + 85) / 100;
    const damage  = Math.max(1, Math.floor(base * stab * typeEff * (isCrit ? 2 : 1) * rnd));
    return { damage, effectiveness: typeEff, isCrit };
  }

  // ── End of turn (burn/poison ticks) ──────────────────────────────────────

  private endOfTurn() {
    this.applyResidualStatus(this.pc, true, () => {
      if (this.pc.currentHp <= 0) { this.onPcFaint(); return; }
      this.applyResidualStatus(this.wild, false, () => {
        if (this.wild.currentHp <= 0) { this.onWildFaint(); return; }
        this.enterMenu();
      });
    });
  }

  private applyResidualStatus(creature: BattleCreature, isPc: boolean, onDone: () => void) {
    if (creature.currentHp <= 0 || (creature.status !== "burn" && creature.status !== "poison")) {
      onDone();
      return;
    }
    const dmg = Math.max(1, Math.floor(creature.maxHp / 16));
    creature.currentHp = Math.max(0, creature.currentHp - dmg);
    if (isPc) this.refreshPcHpPanel(); else this.updateWildHp();
    const verb = creature.status === "burn" ? "hurt by its burn" : "hurt by poison";
    this.showMsg(`${creature.name} is ${verb}!`, onDone);
  }

  // ── Fainting ──────────────────────────────────────────────────────────────

  private onPcFaint() {
    playFaint(this, this.pcSprite, () => {
      this.showMsg(`${this.pc.name} is knocked out!`, () => {
        const hasReserve = this.party.some((c, i) => i !== this.activeIndex && c.currentHp > 0);
        if (hasReserve) this.enterPartySelect(true);
        else this.showMsg("Your party has fallen!", () => {
        const lost = blackout(this.game);
        this.showMsg(
          lost > 0 ? `You come to, healed but ${lost} gold poorer.` : "You come to, healed and ready to try again.",
          () => this.exitBattle(),
        );
      });
      });
    });
  }

  private partyCanUse(gearId: string): boolean {
    const def = EQUIPMENT[gearId];
    return !!def && this.party.some(c => canEquip(classOf(c.speciesId), def));
  }

  private onBossFaint(boss: BossDef) {
    playFaint(this, this.wildSprite, () => {
      this.showMsg(boss.defeatMsg, () => {
        const levelMsgs = gainExp(this.pc, boss.rewardExp);
        this.refreshPcHpPanel();
        addGold(this.game, boss.rewardGold);
        // Prefer a piece someone in the party can actually use.
        const usable = boss.rewardGear.filter(id => this.partyCanUse(id));
        const pool = usable.length ? usable : boss.rewardGear;
        const gear = pool[Math.floor(Math.random() * pool.length)];
        addToInventory(this.game, gear);
        const extras = boss.rewardExtra ?? [];
        for (const id of extras) addToInventory(this.game, id);
        setFlag(this.game, bossFlag(boss.id));
        const questMsgs = recordBoss(this.game, boss.id);
        this.showMsg(`${this.pc.name} gained ${boss.rewardExp} Exp!`, () =>
          this.showSequential(
            [...levelMsgs, `Found ${boss.rewardGold} gold!`, `Obtained ${EQUIPMENT[gear].name}!`, ...extras.map(id => `Obtained ${EQUIPMENT[id].name}!`), ...questMsgs],
            () => this.exitBattle(),
          ));
      });
    });
  }

  private onWildFaint() {
    if (this.boss) { this.onBossFaint(this.boss); return; }
    playFaint(this, this.wildSprite, () => {
      this.showMsg(`The wild ${this.wild.name} is defeated!`, () => {
        const sp = SPECIES[this.wild.speciesId];
        const expGain = Math.max(1, Math.floor(sp.baseExp * this.wild.level / 7));
        const levelMsgs = gainExp(this.pc, expGain);
        this.refreshPcHpPanel();

        // Spoils: gold always, gear sometimes.
        const gold = goldReward(this.wild.level);
        addGold(this.game, gold);
        const spoils = [`Found ${gold} gold!`];
        const drop = rollGearDrop(this.wild.level, def => this.party.some(c => canEquip(classOf(c.speciesId), def)));
        if (drop) {
          addToInventory(this.game, drop);
          spoils.push(`The ${this.wild.name} dropped ${EQUIPMENT[drop].name}!`);
        }

        const questMsgs = recordDefeat(this.game, this.wild.speciesId);

        this.showMsg(`${this.pc.name} gained ${expGain} Exp!`, () =>
          this.showSequential([...levelMsgs, ...spoils, ...questMsgs], () => this.exitBattle()));
      });
    });
  }

  // ── Taming Charm ───────────────────────────────────────────────────────────

  private doBallThrow() {
    this.hideActionButtons();
    const { currentHp: hp, maxHp, catchRate } = this.wild;
    const caught = Math.random() * 255 < (3 * maxHp - 2 * hp) / (3 * maxHp) * catchRate;
    const shakes = caught ? 3 : Math.floor(Math.random() * 3);

    // The monster shrinks into the charm, which then wobbles once per shake.
    const charm = this.add.rectangle(WILD_X, WILD_Y - 14, 10, 10, 0xe0b030)
      .setStrokeStyle(2, 0x7a5a10).setVisible(false);
    playTamed(this, this.wildSprite, () => charm.setVisible(true));

    const doShakes = (n: number, cb: () => void) => {
      if (n <= 0) { cb(); return; }
      playWobble(this, charm);
      this.showMsg("… *shake* …", () => doShakes(n - 1, cb));
    };

    this.showMsg("You threw a Taming Charm!", () =>
      doShakes(shakes, () => {
        if (!caught) {
          charm.destroy();
          playSendIn(this, this.wildSprite);
          this.showMsg(`${this.wild.name} broke free of the charm!`, () => this.enterMenu());
          return;
        }
        this.tweens.add({ targets: charm, y: charm.y - 18, alpha: 0, duration: 450 });
        if (this.party.length < MAX_PARTY_SIZE) {
          this.party.push(this.wild);
          const questMsgs = recordTame(this.game, this.wild.speciesId);
          this.showMsg(`${this.wild.name} was tamed!`, () => this.showSequential(questMsgs, () => this.exitBattle()));
        } else {
          // No storage/PC-box system yet (that's a later milestone) - a catch
          // with a full party is just lost rather than crashing or blocking.
          const questMsgs = recordTame(this.game, this.wild.speciesId);
          this.showMsg(`${this.wild.name} was tamed! But your party is full...`, () => this.showSequential(questMsgs, () => this.exitBattle()));
        }
      }),
    );
  }

  // ── HP updates ────────────────────────────────────────────────────────────

  private updateWildHp() {
    const frac = Math.max(0, this.wild.currentHp / this.wild.maxHp);
    drawHpBar(this.wildHpFill, WILD_BAR_X, WILD_BAR_Y, HP_BAR_W, HP_BAR_H, frac, this.hpColor(frac));
  }

  private updatePcHp() {
    const frac = Math.max(0, this.pc.currentHp / this.pc.maxHp);
    drawHpBar(this.pcHpFill, PC_BAR_X, PC_BAR_Y, HP_BAR_W, HP_BAR_H, frac, this.hpColor(frac));
    this.pcHpText.setText(`${this.pc.currentHp}/${this.pc.maxHp}`);
  }

  /** Refreshes the whole PC panel (name/level/HP) - needed after a party switch, not just damage. */
  private refreshPcHpPanel() {
    this.pcNameText.setText(this.pc.name);
    this.pcLevelText.setText(`Lv.${this.pc.level}`);
    this.updatePcHp();
  }

  private hpColor(f: number): number {
    return f > 0.5 ? 0x44dd44 : f > 0.2 ? 0xdddd44 : 0xdd4444;
  }

  // ── HP panels ─────────────────────────────────────────────────────────────

  private buildWildHpPanel() {
    const [px, py, pw, ph] = [8, 8, 188, 50];
    const g = this.add.graphics();
    drawPanel(g, px, py, pw, ph, { cut: 2, fill: 0x0d1a2e, fillAlpha: 0.9, border: 0x27498f });

    this.add.text(px + 8, py + 6, this.wild.name, { fontSize: "10px", color: "#e8eeff", fontFamily: "monospace" });
    this.add.text(px + pw - 8, py + 6, `Lv.${this.wild.level}`, {
      fontSize: "10px", color: "#aaccff", fontFamily: "monospace" }).setOrigin(1, 0);
    this.add.text(px + 8, py + 26, "HP", { fontSize: "9px", color: "#ffdd44", fontFamily: "monospace" });
    this.wildHpFill = this.add.graphics();
    drawHpBar(this.wildHpFill, WILD_BAR_X, WILD_BAR_Y, HP_BAR_W, HP_BAR_H, 1, this.hpColor(1));
  }

  private buildPcHpPanel() {
    const [px, py, pw, ph] = [216, 126, 256, 50];
    const g = this.add.graphics();
    drawPanel(g, px, py, pw, ph, { cut: 2, fill: 0x0d1a2e, fillAlpha: 0.9, border: 0x27498f });

    this.pcNameText = this.add.text(px + 8, py + 6, this.pc.name, { fontSize: "10px", color: "#e8eeff", fontFamily: "monospace" });
    this.pcLevelText = this.add.text(px + pw - 8, py + 6, `Lv.${this.pc.level}`, {
      fontSize: "10px", color: "#aaccff", fontFamily: "monospace" }).setOrigin(1, 0);
    this.add.text(px + 8, py + 26, "HP", { fontSize: "9px", color: "#ffdd44", fontFamily: "monospace" });
    this.pcHpFill = this.add.graphics();
    drawHpBar(this.pcHpFill, PC_BAR_X, PC_BAR_Y, HP_BAR_W, HP_BAR_H, 1, this.hpColor(1));
    this.pcHpText = this.add.text(px + pw - 8, py + 34, `${this.pc.maxHp}/${this.pc.maxHp}`, {
      fontSize: "9px", color: "#99bbdd", fontFamily: "monospace" }).setOrigin(1, 0);
  }

  // ── Action button rendering ───────────────────────────────────────────────

  private showActionButtons() {
    this.btnGfx.setVisible(true);
    this.btnLabels.forEach(l => l.setVisible(true));
    this.redrawActionButtons();
  }

  private hideActionButtons() {
    this.btnGfx.clear().setVisible(false);
    this.btnLabels.forEach(l => l.setVisible(false));
  }

  private redrawActionButtons() {
    this.btnGfx.clear();
    for (let i = 0; i < 4; i++) {
      const r = Math.floor(i / 2), c = i % 2;
      const [x, y] = [BTN_COLS[c], BTN_ROWS[r]];
      const sel = i === this.cursor;
      drawPanel(this.btnGfx, x, y, BTN_W, BTN_H, {
        cut: 2, borderWidth: 1.5, shadow: false, fillAlpha: 1,
        fill: sel ? 0x1a3a7a : 0x0d1a3a, border: sel ? 0x5a98ff : 0x233a80,
      });
    }
  }

  // ── Exit ──────────────────────────────────────────────────────────────────

  private exitBattle() {
    setParty(this.game, this.party);
    const world = this.scene.get("WorldScene") as WorldScene;
    autosave(this.game, world.getSaveState());
    this.scene.resume("WorldScene");
    this.scene.resume("UIScene");
    this.scene.stop();
  }

  /**
   * Phaser reuses this same Scene *instance* across scene.stop()/scene.launch()
   * cycles (only create() re-runs each battle, not class field initializers),
   * so without this, every array field create() populates via .push() (gridLabels,
   * gridSubLabels, btnLabels) would keep accumulating the previous battle's
   * already-destroyed GameObjects underneath the new ones - and since showGrid()
   * always indexes [0..3], it would read those *stale* entries first, crashing
   * (Phaser's Text/Frame internals throw on a destroyed texture) the moment any
   * grid is shown in the second battle of a session. Clearing the whole display
   * list on shutdown (Phaser's own SHUTDOWN scene event, wired up in create() -
   * a same-named method alone is NOT auto-invoked the way init/preload/create/
   * update are) destroys every GameObject create() made - including ones no
   * field ever tracked, like the background shapes and HP-panel graphics - so
   * each battle starts clean.
   */
  private handleShutdown() {
    this.children.removeAll(true);
    this.btnLabels = [];
    this.gridLabels = [];
    this.gridSubLabels = [];
  }
}

// ── Type colour chips (small pip indicator on move buttons) ───────────────────
const TYPE_CHIP: Record<string, number> = {
  normal:   0xa8a878, fire:     0xf08030, water:    0x6890f0, electric: 0xf8d030,
  grass:    0x78c850, ice:      0x98d8d8, fighting: 0xc03028, poison:   0xa040a0,
  ground:   0xe0c068, flying:   0xa890f0, psychic:  0xf85888, bug:      0xa8b820,
  rock:     0xb8a038, ghost:    0x705898, dragon:   0x7038f8, dark:     0x705848,
  steel:    0xb8b8d0, fairy:    0xee99ac,
};
