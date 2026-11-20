import Phaser from "phaser";
import { makeBattleCreature } from "@/data/creatures";
import type { CreatureType } from "@/types";
import { TYPE_LABELS } from "@/data/typeLabels";
import { fillPanel, strokePanel, cut } from "@/gfx/panel";
import { getInventory, setParty, equipItem } from "@/systems/playerState";
import { BASE_WIDTH, centerFixedLayout } from "@/config";

const TYPE_COLORS: Record<CreatureType, string> = {
  grass:    "#4cbb5c", poison:   "#8040c0", fire:     "#e84a35",
  water:    "#3b91e0", normal:   "#a8a090", electric: "#e0b010",
  flying:   "#9090e0", bug:      "#90b020", rock:     "#b0a038",
  ground:   "#c8a850", psychic:  "#e05090", ice:      "#74d0e4",
  fighting: "#c04848", ghost:    "#705898", dragon:   "#7038f8",
  dark:     "#706858", steel:    "#8a96b8", fairy:    "#e8a0c0",
};

interface StarterDef {
  speciesId: number;
  name: string;
  types: CreatureType[];
  desc: string;
  weapon: string;
}

const STARTERS: StarterDef[] = [
  {
    speciesId: 1,
    name:  "Ranger",
    types: ["grass", "poison"],
    weapon: "short_bow",
    desc:  "A hooded archer of the\nwilds. Poisoned arrows\nand patient aim.",
  },
  {
    speciesId: 4,
    name:  "Mage",
    types: ["fire"],
    weapon: "oak_staff",
    desc:  "A battle-mage whose\nstaff burns bright.\nFragile but fast.",
  },
  {
    speciesId: 7,
    name:  "Knight",
    types: ["steel"],
    weapon: "rusty_sword",
    desc:  "Sword and shield, sworn\nto the realm. Slow,\nbut hard to break.",
  },
];

const SPR_X: [number, number, number] = [120, 240, 360];
const SPR_Y = 148;
const HL_W  = 98;
const HL_H  = 142;
const HL_TOP = 68;

// CHOOSE button (bottom centre) and touch gesture thresholds, in logical px
const CHOOSE_W = 150, CHOOSE_H = 19;
const CHOOSE_X = (BASE_WIDTH - CHOOSE_W) / 2, CHOOSE_Y = 299;
const SWIPE_MIN = 30; // horizontal travel that counts as a swipe
const TAP_MAX   = 14; // movement under this counts as a tap

export class StarterScene extends Phaser.Scene {
  private cursors!:    Phaser.Types.Input.Keyboard.CursorKeys;
  private leftKey!:    Phaser.Input.Keyboard.Key;
  private rightKey!:   Phaser.Input.Keyboard.Key;
  private confirmKey!: Phaser.Input.Keyboard.Key;

  private selected  = 1; // start on the Mage (center)
  private sprites:    Phaser.GameObjects.Image[] = [];
  private highlight!: Phaser.GameObjects.Graphics;
  private nameText!:  Phaser.GameObjects.Text;
  private descText!:  Phaser.GameObjects.Text;
  private chooseText!: Phaser.GameObjects.Text;
  private badges:    Phaser.GameObjects.Text[] = [];
  private canInput  = false;
  private confirmed = false;

  constructor() { super({ key: "StarterScene" }); }

  create() {
    centerFixedLayout(this);
    const W = BASE_WIDTH;         // 480 (scene is centred in wider canvases)
    const H = this.scale.height;  // 320

    // ── Background ───────────────────────────────────────────────────────────
    this.add.rectangle(-1000, 0, W + 2000, H, 0x08091a).setOrigin(0);

    // Pixel star field
    const starGfx = this.add.graphics();
    starGfx.fillStyle(0xffffff, 0.55);
    const STARS = [
      [28,12],[95,6],[185,22],[280,8],[375,18],[455,28],
      [14,55],[72,82],[160,62],[265,75],[395,58],[468,72],
      [40,132],[458,118],[22,202],[472,208],[58,272],[422,265],
    ];
    for (const [x, y] of STARS) starGfx.fillRect(x, y, 1, 1);

    // Subtle ground line at bottom
    const gndGfx = this.add.graphics();
    gndGfx.fillStyle(0x0f1238, 1);
    gndGfx.fillRect(-1000, H - 30, W + 2000, 30);
    gndGfx.lineStyle(1, 0x1a2255, 1);
    gndGfx.strokeRect(-1000, H - 30, W + 2000, 1);

    // Card panel behind starters
    const card = this.add.graphics();
    card.fillStyle(0x0c1030, 0.7);
    fillPanel(card, 34, 60, W - 68, 170, cut(8));
    card.fillStyle(0x1e2f88, 0.55);
    strokePanel(card, 34, 60, W - 68, 170, cut(8), 1);

    // Shadow ellipses under each sprite (grounding)
    const shadowGfx = this.add.graphics();
    shadowGfx.fillStyle(0x000000, 0.22);
    for (const x of SPR_X) shadowGfx.fillEllipse(x, 216, 78, 10);

    // ── Title ────────────────────────────────────────────────────────────────
    this.add.text(W / 2, 20, "CHOOSE YOUR CLASS", {
      fontSize: "13px", color: "#ddeeff",
      fontFamily: "monospace", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(2);

    this.add.text(W / 2, 38, "The realm needs a hero.", {
      fontSize: "9px", color: "#374466", fontFamily: "monospace",
    }).setOrigin(0.5).setDepth(2);

    // ── Highlight box ────────────────────────────────────────────────────────
    this.highlight = this.add.graphics().setDepth(3);

    // ── Starter sprites ──────────────────────────────────────────────────────
    for (let i = 0; i < 3; i++) {
      const spr = this.add
        .image(SPR_X[i], SPR_Y, `creature-front-${STARTERS[i].speciesId}`)
        .setScale(i === this.selected ? 1.65 : 1.2)
        .setAlpha(i === this.selected ? 1.0 : 0.42)
        .setDepth(4);
      this.sprites.push(spr);
    }

    // ── Info panel ───────────────────────────────────────────────────────────
    this.nameText = this.add.text(W / 2, 228, "", {
      fontSize: "13px", color: "#ffffff",
      fontFamily: "monospace", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(5);

    // Two type badge slots
    for (let i = 0; i < 2; i++) {
      const t = this.add.text(0, 246, "", {
        fontSize: "8px", color: "#ffffff",
        fontFamily: "monospace",
        padding: { x: 5, y: 2 },
      }).setOrigin(0.5, 0).setDepth(5).setVisible(false);
      this.badges.push(t);
    }

    this.descText = this.add.text(W / 2, 280, "", {
      fontSize: "9px", color: "#5e6e99",
      fontFamily: "monospace", align: "center",
    }).setOrigin(0.5).setDepth(5);

    // ── Touch UI: side arrows + CHOOSE button (swipe / tap a class also work) ─
    for (const [x, ch] of [[16, "◄"], [W - 16, "►"]] as const) {
      this.add.text(x, SPR_Y, ch, { fontSize: "20px", color: "#4a63b8", fontFamily: "monospace" })
        .setOrigin(0.5).setDepth(5);
    }
    const btn = this.add.graphics().setDepth(5);
    btn.fillStyle(0x1a3a7a, 0.95);
    fillPanel(btn, CHOOSE_X, CHOOSE_Y, CHOOSE_W, CHOOSE_H, cut(5));
    btn.fillStyle(0x4488ff, 1);
    strokePanel(btn, CHOOSE_X, CHOOSE_Y, CHOOSE_W, CHOOSE_H, cut(5), 1);
    this.chooseText = this.add.text(CHOOSE_X + CHOOSE_W / 2, CHOOSE_Y + CHOOSE_H / 2, "", {
      fontSize: "10px", color: "#ffffff", fontFamily: "monospace", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(6);
    this.add.text(10, CHOOSE_Y + CHOOSE_H / 2, "◄ ► / A D   Z", {
      fontSize: "8px", color: "#252e4a", fontFamily: "monospace",
    }).setOrigin(0, 0.5).setDepth(5);

    // ── Input ────────────────────────────────────────────────────────────────
    this.cursors    = this.input.keyboard!.createCursorKeys();
    this.leftKey    = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey   = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.confirmKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // Touch / mouse: swipe or tap an arrow to browse; tap a class to pick it, tap it again
    // (or the CHOOSE button) to confirm. Decided on release so a swipe never counts as a tap.
    this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      if (!this.canInput || this.confirmed) return;
      const dx = p.upX - p.downX;
      const dy = p.upY - p.downY;
      if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
        this.step(dx < 0 ? 1 : -1); // swipe left reveals the class on the right
        return;
      }
      if (Math.hypot(dx, dy) > TAP_MAX) return;
      const pt = this.cameras.main.getWorldPoint(p.upX, p.upY);
      this.tapAt(pt.x, pt.y);
    });

    this.refreshDisplay();

    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.time.delayedCall(560, () => { this.canInput = true; });
  }

  update() {
    if (!this.canInput || this.confirmed) return;

    const goLeft  = Phaser.Input.Keyboard.JustDown(this.cursors.left!)
                 || Phaser.Input.Keyboard.JustDown(this.leftKey);
    const goRight = Phaser.Input.Keyboard.JustDown(this.cursors.right!)
                 || Phaser.Input.Keyboard.JustDown(this.rightKey);

    if (goLeft)  this.step(-1);
    if (goRight) this.step(1);

    if (Phaser.Input.Keyboard.JustDown(this.confirmKey)) this.confirm();
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private step(dir: 1 | -1): void {
    this.selected = (this.selected + dir + 3) % 3;
    this.refreshDisplay();
  }

  /** A tap at scene coordinates (x, y), already converted from screen space. */
  private tapAt(x: number, y: number): void {
    const inRect = (rx: number, ry: number, rw: number, rh: number) =>
      x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;

    if (inRect(CHOOSE_X, CHOOSE_Y, CHOOSE_W, CHOOSE_H)) { this.confirm(); return; }
    if (inRect(-20, HL_TOP, 54, HL_H)) { this.step(-1); return; }                // left arrow strip
    if (inRect(BASE_WIDTH - 34, HL_TOP, 54, HL_H)) { this.step(1); return; }     // right arrow strip
    for (let i = 0; i < 3; i++) {
      if (!inRect(SPR_X[i] - HL_W / 2, HL_TOP, HL_W, HL_H)) continue;
      if (i === this.selected) this.confirm();
      else { this.selected = i; this.refreshDisplay(); }
      return;
    }
  }

  private refreshDisplay(): void {
    const W       = BASE_WIDTH;
    const starter = STARTERS[this.selected];
    const hx      = SPR_X[this.selected];

    // Highlight glow
    this.highlight.clear();
    this.highlight.fillStyle(0x2244cc, 0.16);
    fillPanel(this.highlight, hx - HL_W / 2, HL_TOP, HL_W, HL_H, cut(7));
    this.highlight.fillStyle(0x4488ff, 0.88);
    strokePanel(this.highlight, hx - HL_W / 2, HL_TOP, HL_W, HL_H, cut(7), 2);

    // Tween sprites: selected grows, others shrink + dim
    for (let i = 0; i < 3; i++) {
      this.tweens.add({
        targets: this.sprites[i],
        scale: i === this.selected ? 1.65 : 1.2,
        alpha: i === this.selected ? 1.0  : 0.42,
        duration: 150,
        ease: "Quad.Out",
      });
    }

    // Name
    this.nameText.setText(starter.name.toUpperCase());
    this.chooseText.setText(`CHOOSE ${starter.name.toUpperCase()}`);

    // Type badges — centered, 1 or 2 types
    const types = starter.types;
    const bPositions = types.length === 1
      ? [W / 2]
      : [W / 2 - 32, W / 2 + 32];

    for (let i = 0; i < 2; i++) {
      if (i < types.length) {
        this.badges[i]
          .setText(TYPE_LABELS[types[i]].toUpperCase())
          .setBackgroundColor(TYPE_COLORS[types[i]] ?? "#555566")
          .setPosition(bPositions[i], 246)
          .setVisible(true);
      } else {
        this.badges[i].setVisible(false);
      }
    }

    // Description
    this.descText.setText(starter.desc);
  }

  private confirm(): void {
    this.confirmed = true;
    const starter  = STARTERS[this.selected];
    this.game.registry.set("starterSpeciesId", starter.speciesId);
    const hero = makeBattleCreature(starter.speciesId, 5);
    const party = [hero];
    setParty(this.game, party);
    const inv = getInventory(this.game); // seeds the starting inventory on first access
    // Starting weapon, taken from a free copy so the normal equip path is used.
    inv[starter.weapon] = (inv[starter.weapon] ?? 0) + 1;
    equipItem(this.game, hero, "weapon", starter.weapon);

    this.nameText.setText(`You are the ${starter.name}!`).setColor("#ffdd88");
    this.descText.setText("Your legend begins...");

    this.cameras.main.flash(220, 255, 255, 255, true);
    this.time.delayedCall(680, () => {
      this.cameras.main.fadeOut(380, 0, 0, 0);
    });
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("WorldScene");
    });
  }
}
