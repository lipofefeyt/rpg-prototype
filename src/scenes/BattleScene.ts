import Phaser from "phaser";
import { makeBattleCreature, gainExp, SPECIES, type BattleCreature, type StatusCondition } from "@/data/creatures";
import { MOVES, type MoveDef } from "@/data/moves";
import { getTotalEffect } from "@/data/typeChart";
import { ITEMS } from "@/data/items";
import { MAX_PARTY_SIZE, getParty, setParty, getInventory, setInventory } from "@/systems/playerState";
import { autosave } from "@/systems/saveLoad";
import type { WorldScene } from "@/scenes/WorldScene";

// ── Layout ────────────────────────────────────────────────────────────────────
const W = 480, H = 320;
const FIELD_H = 178;
const UI_Y    = FIELD_H;
const SKY_H   = 108;

const WILD_X = 370, WILD_Y = 148;
const PLYR_X =  90, PLYR_Y = 170;
const HP_BAR_W = 155, HP_BAR_H = 6;

const BTN_W = 234, BTN_H = 30;
const BTN_ROWS = [UI_Y + 66, UI_Y + 100];
const BTN_COLS = [4, 242];

export interface BattleInitData {
  wildSpeciesId: number;
  wildLevel: number;
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

  private party!: BattleCreature[];
  private activeIndex = 0;
  private get pc(): BattleCreature { return this.party[this.activeIndex]; }

  private itemIds: string[] = []; // in-stock item ids backing the current item-select grid

  private wildSprite!: Phaser.GameObjects.Image;
  private pcSprite!: Phaser.GameObjects.Image;

  private wildHpFill!: Phaser.GameObjects.Rectangle;
  private pcHpFill!: Phaser.GameObjects.Rectangle;
  private pcHpText!: Phaser.GameObjects.Text;
  private pcNameText!: Phaser.GameObjects.Text;
  private pcLevelText!: Phaser.GameObjects.Text;

  private msgText!: Phaser.GameObjects.Text;
  private btnGfx!: Phaser.GameObjects.Graphics;
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

    const { wildSpeciesId, wildLevel, zoneId } = this.battleInit;
    this.wild = makeBattleCreature(wildSpeciesId, wildLevel);

    this.party = getParty(this.game);
    if (this.party.length === 0) {
      // Safety fallback only - StarterScene always seeds the party on confirm.
      const starterSpeciesId = (this.game.registry.get("starterSpeciesId") as number | undefined) ?? 7;
      this.party = [makeBattleCreature(starterSpeciesId, 5)];
    }
    this.activeIndex = Math.max(0, this.party.findIndex(c => c.currentHp > 0));

    const cave = zoneId === "cave";
    const skyCol = cave ? 0x1c1228 : 0x87ceeb;
    const gndCol = cave ? 0x3a2a2a : 0x5a8e3a;
    const hrzCol = cave ? 0x2a1a3a : 0x3a6a1a;
    const shdCol = cave ? 0x2a1a2a : 0x336633;

    // Background
    this.add.rectangle(W / 2, SKY_H / 2,              W, SKY_H,           skyCol);
    this.add.rectangle(W / 2, SKY_H + (FIELD_H - SKY_H) / 2, W, FIELD_H - SKY_H, gndCol);
    this.add.rectangle(W / 2, SKY_H, W, 2, hrzCol);
    this.add.ellipse(WILD_X, WILD_Y + 2, 56, 10, shdCol, 0.55);
    this.add.ellipse(PLYR_X, PLYR_Y + 2, 56, 10, shdCol, 0.55);

    // Battle sprites
    this.wildSprite = this.add
      .image(WILD_X, WILD_Y, `creature-front-${wildSpeciesId}`)
      .setOrigin(0.5, 1);
    this.pcSprite = this.add
      .image(PLYR_X, PLYR_Y, `creature-back-${this.pc.speciesId}`)
      .setOrigin(0.5, 1);

    // HP panels
    this.buildWildHpPanel();
    this.buildPcHpPanel();

    // Divider + bottom BG
    this.add.rectangle(W / 2, FIELD_H, W, 2, 0x000000).setOrigin(0.5, 0);
    this.add.rectangle(W / 2, UI_Y + (H - UI_Y) / 2, W, H - UI_Y, 0x090916);

    // Message text
    this.msgText = this.add.text(12, UI_Y + 8, "", {
      fontSize: "12px", color: "#e8eeff", fontFamily: "monospace",
      wordWrap: { width: W - 24 },
    });

    // Action buttons
    this.btnGfx = this.add.graphics();
    const ACTION_LABELS = ["FIGHT", "BAG", "PARTY", "RUN"];
    for (let i = 0; i < 4; i++) {
      const r = Math.floor(i / 2), c = i % 2;
      this.btnLabels.push(
        this.add.text(BTN_COLS[c] + BTN_W / 2, BTN_ROWS[r] + BTN_H / 2, ACTION_LABELS[i], {
          fontSize: "11px", color: "#e8eeff", fontFamily: "monospace",
        }).setOrigin(0.5),
      );
    }

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

    // Intro
    this.hideActionButtons();
    this.showMsg(`A wild ${this.wild.name} appeared!`, () =>
      this.showMsg(`Go! ${this.pc.name}!`, () => this.enterMenu()),
    );
  }

  update() {
    const JD = Phaser.Input.Keyboard.JustDown;
    if (this.msgWaiting) { if (JD(this.zKey)) this.advanceMsg(); return; }
    if (this.state === "menu") this.handleMenuInput();
    else this.handleGridInput(); // move-select / item-select / party-select(-forced)
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
    for (let i = 0; i < 4; i++) {
      const e = entries[i];
      this.gridLabels[i].setText(e?.label ?? "—").setVisible(true);
      this.gridSubLabels[i].setText(e?.sublabel ?? "").setVisible(true);
    }
    this.redrawGrid();
  }

  private hideGrid() {
    this.gridGfx.clear().setVisible(false);
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
      this.gridGfx.fillStyle(sel ? 0x1a3a7a : (enabled ? 0x0d1a3a : 0x0a0a1a));
      this.gridGfx.fillRect(x, y, BTN_W, BTN_H);
      this.gridGfx.lineStyle(1.5, sel ? 0x4488ff : (enabled ? 0x1a2255 : 0x111111));
      this.gridGfx.strokeRect(x, y, BTN_W, BTN_H);
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
    this.showMsg(`${this.pc.name} was healed!`, () => this.enterMenu());
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
    this.msgText.setText(forced ? "Choose next creature:" : "Switch to which creature?");
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
      if (!forced) this.showMsg("Can't switch to that creature!", () => { this.state = "party-select"; });
      return;
    }
    this.hideGrid();
    this.activeIndex = i;
    this.pcSprite.setTexture(`creature-back-${this.pc.speciesId}`);
    this.refreshPcHpPanel();
    // Switching (forced or voluntary) always ends the current action and
    // returns to the main menu - a voluntary switch doesn't cost a free
    // enemy attack in this build, a deliberate simplification.
    this.showMsg(`Go! ${this.pc.name}!`, () => this.enterMenu());
  }

  // ── Turn execution ────────────────────────────────────────────────────────

  private executeTurn(playerMoveIdx: number) {
    const pSlot = this.pc.moves[playerMoveIdx];
    const eSlot = this.wild.moves[Math.floor(Math.random() * this.wild.moves.length)];
    pSlot.pp = Math.max(0, pSlot.pp - 1);

    const pPrio = MOVES[pSlot.moveId]?.priority ?? 0;
    const ePrio = MOVES[eSlot.moveId]?.priority ?? 0;
    const playerFirst = pPrio > ePrio || (pPrio === ePrio && this.pc.speed >= this.wild.speed);

    const doPlayerAction = (next: () => void) =>
      this.takeTurn(this.pc, this.wild, this.wildSprite, pSlot.moveId, () => {
        this.updateWildHp();
        if (this.wild.currentHp <= 0) { this.onWildFaint(); return; }
        next();
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

    this.showMsg(`${attacker.name} used ${move.name}!`, () => {
      if (move.category === "status") { this.resolveStatusMove(move, defender, onDone); return; }
      const res = this.calcDamage(attacker, defender, moveId);
      defender.currentHp = Math.max(0, defender.currentHp - res.damage);
      this.shakeSprite(defSprite, () => {
        if (res.isCrit)         this.showMsg("A critical hit!", () => this.showEffMsg(res.effectiveness, onDone));
        else                    this.showEffMsg(res.effectiveness, onDone);
      });
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

  private shakeSprite(sprite: Phaser.GameObjects.Image, onDone: () => void) {
    const ox = sprite.x;
    this.tweens.add({
      targets: sprite, x: ox + 6, duration: 45, yoyo: true, repeat: 2, ease: "Linear",
      onComplete: () => {
        sprite.x = ox;
        sprite.setTint(0xffffff);
        this.time.delayedCall(80, () => { sprite.clearTint(); onDone(); });
      },
    });
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
    this.showMsg(`${this.pc.name} fainted!`, () => {
      const hasReserve = this.party.some((c, i) => i !== this.activeIndex && c.currentHp > 0);
      if (hasReserve) this.enterPartySelect(true);
      else this.showMsg("You blacked out!", () => this.exitBattle());
    });
  }

  private onWildFaint() {
    this.showMsg(`Wild ${this.wild.name} fainted!`, () => {
      const sp = SPECIES[this.wild.speciesId];
      const expGain = Math.max(1, Math.floor(sp.baseExp * this.wild.level / 7));
      const levelMsgs = gainExp(this.pc, expGain);
      this.refreshPcHpPanel();
      this.showMsg(`${this.pc.name} gained ${expGain} Exp!`, () =>
        this.showSequential(levelMsgs, () => this.exitBattle()));
    });
  }

  // ── Capture Orb ───────────────────────────────────────────────────────────

  private doBallThrow() {
    this.hideActionButtons();
    const { currentHp: hp, maxHp, catchRate } = this.wild;
    const caught = Math.random() * 255 < (3 * maxHp - 2 * hp) / (3 * maxHp) * catchRate;
    const shakes = caught ? 3 : Math.floor(Math.random() * 3);

    const doShakes = (n: number, cb: () => void) => {
      if (n <= 0) { cb(); return; }
      this.showMsg("… *shake* …", () => doShakes(n - 1, cb));
    };

    this.showMsg("You threw a Capture Orb!", () =>
      doShakes(shakes, () => {
        if (!caught) {
          this.showMsg(`Oh! ${this.wild.name} broke free!`, () => this.enterMenu());
          return;
        }
        if (this.party.length < MAX_PARTY_SIZE) {
          this.party.push(this.wild);
          this.showMsg(`${this.wild.name} was caught!`, () => this.exitBattle());
        } else {
          // No storage/PC-box system yet (that's a later milestone) - a catch
          // with a full party is just lost rather than crashing or blocking.
          this.showMsg(`${this.wild.name} was caught! But your party is full...`, () => this.exitBattle());
        }
      }),
    );
  }

  // ── HP updates ────────────────────────────────────────────────────────────

  private updateWildHp() {
    const frac = Math.max(0, this.wild.currentHp / this.wild.maxHp);
    this.wildHpFill.setSize(Math.max(1, Math.floor(HP_BAR_W * frac)), HP_BAR_H)
      .setFillStyle(this.hpColor(frac));
  }

  private updatePcHp() {
    const frac = Math.max(0, this.pc.currentHp / this.pc.maxHp);
    this.pcHpFill.setSize(Math.max(1, Math.floor(HP_BAR_W * frac)), HP_BAR_H)
      .setFillStyle(this.hpColor(frac));
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
    g.fillStyle(0x0d1a2e, 0.88); g.fillRoundedRect(px, py, pw, ph, 4);
    g.lineStyle(1.5, 0x1e3a6a);  g.strokeRoundedRect(px, py, pw, ph, 4);

    this.add.text(px + 8, py + 6, this.wild.name, { fontSize: "10px", color: "#e8eeff", fontFamily: "monospace" });
    this.add.text(px + pw - 8, py + 6, `Lv.${this.wild.level}`, {
      fontSize: "10px", color: "#aaccff", fontFamily: "monospace" }).setOrigin(1, 0);
    this.add.text(px + 8, py + 26, "HP", { fontSize: "9px", color: "#ffdd44", fontFamily: "monospace" });
    this.add.rectangle(px + 26, py + 30, HP_BAR_W, HP_BAR_H, 0x1a1a2a).setOrigin(0, 0.5);
    this.wildHpFill = this.add.rectangle(px + 26, py + 30, HP_BAR_W, HP_BAR_H, 0x44dd44).setOrigin(0, 0.5);
  }

  private buildPcHpPanel() {
    const [px, py, pw, ph] = [216, 126, 256, 50];
    const g = this.add.graphics();
    g.fillStyle(0x0d1a2e, 0.88); g.fillRoundedRect(px, py, pw, ph, 4);
    g.lineStyle(1.5, 0x1e3a6a);  g.strokeRoundedRect(px, py, pw, ph, 4);

    this.pcNameText = this.add.text(px + 8, py + 6, this.pc.name, { fontSize: "10px", color: "#e8eeff", fontFamily: "monospace" });
    this.pcLevelText = this.add.text(px + pw - 8, py + 6, `Lv.${this.pc.level}`, {
      fontSize: "10px", color: "#aaccff", fontFamily: "monospace" }).setOrigin(1, 0);
    this.add.text(px + 8, py + 26, "HP", { fontSize: "9px", color: "#ffdd44", fontFamily: "monospace" });
    this.add.rectangle(px + 26, py + 30, HP_BAR_W, HP_BAR_H, 0x1a1a2a).setOrigin(0, 0.5);
    this.pcHpFill = this.add.rectangle(px + 26, py + 30, HP_BAR_W, HP_BAR_H, 0x44dd44).setOrigin(0, 0.5);
    this.pcHpText = this.add.text(px + pw - 8, py + 40, `${this.pc.maxHp}/${this.pc.maxHp}`, {
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
      this.btnGfx.fillStyle(sel ? 0x1a3a7a : 0x0d1a3a);
      this.btnGfx.fillRect(x, y, BTN_W, BTN_H);
      this.btnGfx.lineStyle(1.5, sel ? 0x4488ff : 0x1a2255);
      this.btnGfx.strokeRect(x, y, BTN_W, BTN_H);
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
