import Phaser from "phaser";
import { makeBattleCreature, type BattleCreature } from "@/data/creatures";
import { MOVES } from "@/data/moves";
import { getTotalEffect } from "@/data/typeChart";

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

type BattleState = "menu" | "move-select";

interface DamageResult { damage: number; effectiveness: number; isCrit: boolean }

export class BattleScene extends Phaser.Scene {
  private battleInit!: BattleInitData;
  private wild!: BattleCreature;
  private pc!: BattleCreature;

  private wildSprite!: Phaser.GameObjects.Image;
  private pcSprite!: Phaser.GameObjects.Image;

  private wildHpFill!: Phaser.GameObjects.Rectangle;
  private pcHpFill!: Phaser.GameObjects.Rectangle;
  private pcHpText!: Phaser.GameObjects.Text;

  private msgText!: Phaser.GameObjects.Text;
  private btnGfx!: Phaser.GameObjects.Graphics;
  private btnLabels: Phaser.GameObjects.Text[] = [];
  private moveGfx!: Phaser.GameObjects.Graphics;
  private moveLabels: Phaser.GameObjects.Text[] = [];
  private movePpLabels: Phaser.GameObjects.Text[] = [];

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
    const { wildSpeciesId, wildLevel, zoneId } = this.battleInit;
    this.wild = makeBattleCreature(wildSpeciesId, wildLevel);
    const starterSpeciesId = (this.game.registry.get("starterSpeciesId") as number | undefined) ?? 7;
    this.pc   = makeBattleCreature(starterSpeciesId, 5);

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
    const ACTION_LABELS = ["FIGHT", "BAG", "POKÉMON", "RUN"];
    for (let i = 0; i < 4; i++) {
      const r = Math.floor(i / 2), c = i % 2;
      this.btnLabels.push(
        this.add.text(BTN_COLS[c] + BTN_W / 2, BTN_ROWS[r] + BTN_H / 2, ACTION_LABELS[i], {
          fontSize: "11px", color: "#e8eeff", fontFamily: "monospace",
        }).setOrigin(0.5),
      );
    }

    // Move buttons
    this.moveGfx = this.add.graphics();
    for (let i = 0; i < 4; i++) {
      const r = Math.floor(i / 2), c = i % 2;
      this.moveLabels.push(
        this.add.text(BTN_COLS[c] + 10, BTN_ROWS[r] + BTN_H / 2 - 5, "", {
          fontSize: "10px", color: "#e8eeff", fontFamily: "monospace",
        }),
      );
      this.movePpLabels.push(
        this.add.text(BTN_COLS[c] + BTN_W - 6, BTN_ROWS[r] + BTN_H / 2 + 5, "", {
          fontSize: "9px", color: "#aabbcc", fontFamily: "monospace",
        }).setOrigin(1, 0.5),
      );
    }
    this.hideMoveButtons();

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
    if (this.state === "menu")         this.handleMenuInput();
    else if (this.state === "move-select") this.handleMoveInput();
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

  // ── Menu ──────────────────────────────────────────────────────────────────

  private enterMenu() {
    this.state = "menu";
    this.cursor = 0;
    this.msgText.setText("What will you do?");
    this.showActionButtons();
    this.hideMoveButtons();
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
      case 1: this.doBallThrow(); break;
      case 2: this.showMsg("No other Pokémon in party!", () => this.enterMenu()); break;
      case 3:
        this.hideActionButtons();
        this.showMsg("Got away safely!", () => this.exitBattle());
        break;
    }
  }

  // ── Move select ───────────────────────────────────────────────────────────

  private enterMoveSelect() {
    this.state = "move-select";
    this.cursor = 0;
    this.msgText.setText("Choose a move:");
    this.hideActionButtons();
    this.showMoveButtons();
  }

  private handleMoveInput() {
    const JD = Phaser.Input.Keyboard.JustDown;
    if (JD(this.leftKey) || JD(this.rightKey)) { this.cursor ^= 1; this.redrawMoveButtons(); }
    if (JD(this.upKey)   || JD(this.downKey))  { this.cursor ^= 2; this.redrawMoveButtons(); }
    if (JD(this.xKey)) { this.enterMenu(); return; }
    if (JD(this.zKey)) {
      const slot = this.pc.moves[this.cursor];
      if (!slot || slot.pp === 0) {
        this.showMsg("No PP left for that move!", () => { this.state = "move-select"; });
        return;
      }
      this.hideMoveButtons();
      this.executeTurn(this.cursor);
    }
  }

  // ── Turn execution ────────────────────────────────────────────────────────

  private executeTurn(playerMoveIdx: number) {
    const pSlot = this.pc.moves[playerMoveIdx];
    const eSlot = this.wild.moves[Math.floor(Math.random() * this.wild.moves.length)];
    pSlot.pp = Math.max(0, pSlot.pp - 1);

    const pPrio = MOVES[pSlot.moveId]?.priority ?? 0;
    const ePrio = MOVES[eSlot.moveId]?.priority ?? 0;
    const playerFirst = pPrio > ePrio || (pPrio === ePrio && this.pc.speed >= this.wild.speed);

    const doPlayer = (next: () => void) =>
      this.doAttack(this.pc, this.wild, this.wildSprite, pSlot.moveId, () => {
        this.updateWildHp();
        if (this.wild.currentHp <= 0)
          this.showMsg(`Wild ${this.wild.name} fainted!`, () =>
            this.showMsg(`${this.pc.name} gained Exp!`, () => this.exitBattle()));
        else next();
      });

    const doEnemy = (next: () => void) =>
      this.doAttack(this.wild, this.pc, this.pcSprite, eSlot.moveId, () => {
        this.updatePcHp();
        if (this.pc.currentHp <= 0)
          this.showMsg(`${this.pc.name} fainted!`, () =>
            this.showMsg("You blacked out!", () => this.exitBattle()));
        else next();
      });

    if (playerFirst) doPlayer(() => doEnemy(() => this.enterMenu()));
    else             doEnemy(() => doPlayer(() => this.enterMenu()));
  }

  private doAttack(
    attacker: BattleCreature, defender: BattleCreature,
    defSprite: Phaser.GameObjects.Image,
    moveId: string, onDone: () => void,
  ) {
    const move = MOVES[moveId];
    if (!move) { onDone(); return; }

    this.showMsg(`${attacker.name} used ${move.name}!`, () => {
      if (move.category === "status") { onDone(); return; }
      const res = this.calcDamage(attacker, defender, moveId);
      defender.currentHp = Math.max(0, defender.currentHp - res.damage);
      this.shakeSprite(defSprite, () => {
        if (res.isCrit)         this.showMsg("A critical hit!", () => this.showEffMsg(res.effectiveness, onDone));
        else                    this.showEffMsg(res.effectiveness, onDone);
      });
    });
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

  // ── Poké Ball ─────────────────────────────────────────────────────────────

  private doBallThrow() {
    this.hideActionButtons();
    const { currentHp: hp, maxHp, catchRate } = this.wild;
    const caught = Math.random() * 255 < (3 * maxHp - 2 * hp) / (3 * maxHp) * catchRate;
    const shakes = caught ? 3 : Math.floor(Math.random() * 3);

    const doShakes = (n: number, cb: () => void) => {
      if (n <= 0) { cb(); return; }
      this.showMsg("… *shake* …", () => doShakes(n - 1, cb));
    };

    this.showMsg("You threw a Poké Ball!", () =>
      doShakes(shakes, () => {
        if (caught)
          this.showMsg(`${this.wild.name} was caught! Gotcha!`, () => this.exitBattle());
        else
          this.showMsg(`Oh! ${this.wild.name} broke free!`, () => this.enterMenu());
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

    this.add.text(px + 8, py + 6, this.pc.name, { fontSize: "10px", color: "#e8eeff", fontFamily: "monospace" });
    this.add.text(px + pw - 8, py + 6, `Lv.${this.pc.level}`, {
      fontSize: "10px", color: "#aaccff", fontFamily: "monospace" }).setOrigin(1, 0);
    this.add.text(px + 8, py + 26, "HP", { fontSize: "9px", color: "#ffdd44", fontFamily: "monospace" });
    this.add.rectangle(px + 26, py + 30, HP_BAR_W, HP_BAR_H, 0x1a1a2a).setOrigin(0, 0.5);
    this.pcHpFill = this.add.rectangle(px + 26, py + 30, HP_BAR_W, HP_BAR_H, 0x44dd44).setOrigin(0, 0.5);
    this.pcHpText = this.add.text(px + pw - 8, py + 40, `${this.pc.maxHp}/${this.pc.maxHp}`, {
      fontSize: "9px", color: "#99bbdd", fontFamily: "monospace" }).setOrigin(1, 0);
  }

  // ── Button rendering ──────────────────────────────────────────────────────

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

  private showMoveButtons() {
    this.moveGfx.setVisible(true);
    for (let i = 0; i < 4; i++) {
      const slot = this.pc.moves[i];
      const mv   = slot ? MOVES[slot.moveId] : null;
      this.moveLabels[i].setText(mv?.name ?? "—").setVisible(true);
      this.movePpLabels[i].setText(slot ? `PP ${slot.pp}/${slot.maxPp}` : "").setVisible(true);
    }
    this.redrawMoveButtons();
  }

  private hideMoveButtons() {
    this.moveGfx.clear().setVisible(false);
    this.moveLabels.forEach(l => l.setVisible(false));
    this.movePpLabels.forEach(l => l.setVisible(false));
  }

  private redrawMoveButtons() {
    this.moveGfx.clear();
    for (let i = 0; i < 4; i++) {
      const r = Math.floor(i / 2), c = i % 2;
      const [x, y] = [BTN_COLS[c], BTN_ROWS[r]];
      const sel  = i === this.cursor;
      const hasPp = (this.pc.moves[i]?.pp ?? 0) > 0;
      this.moveGfx.fillStyle(sel ? 0x1a3a7a : (hasPp ? 0x0d1a3a : 0x0a0a1a));
      this.moveGfx.fillRect(x, y, BTN_W, BTN_H);
      this.moveGfx.lineStyle(1.5, sel ? 0x4488ff : (hasPp ? 0x1a2255 : 0x111111));
      this.moveGfx.strokeRect(x, y, BTN_W, BTN_H);
      // Type colour pip
      const mv = this.pc.moves[i] ? MOVES[this.pc.moves[i].moveId] : null;
      if (mv) {
        this.moveGfx.fillStyle(TYPE_CHIP[mv.type] ?? 0x888888);
        this.moveGfx.fillRect(x + BTN_W - 14, y + 5, 8, 8);
      }
    }
  }

  // ── Exit ──────────────────────────────────────────────────────────────────

  private exitBattle() {
    this.scene.resume("WorldScene");
    this.scene.resume("UIScene");
    this.scene.stop();
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
