import Phaser from "phaser";

const TYPE_COLORS: Record<string, string> = {
  Grass:    "#4cbb5c", Poison:   "#8040c0", Fire:     "#e84a35",
  Water:    "#3b91e0", Normal:   "#a8a090", Electric: "#e0b010",
  Flying:   "#9090e0", Bug:      "#90b020", Rock:     "#b0a038",
  Ground:   "#c8a850", Psychic:  "#e05090", Ice:      "#74d0e4",
  Fighting: "#c04848", Ghost:    "#705898", Dragon:   "#7038f8",
  Dark:     "#706858", Steel:    "#b8b8d0", Fairy:    "#e8a0c0",
};

interface StarterDef {
  speciesId: number;
  name: string;
  types: string[];
  desc: string;
}

const STARTERS: StarterDef[] = [
  {
    speciesId: 1,
    name:  "Bulbasaur",
    types: ["Grass", "Poison"],
    desc:  "Carries a seed on\nits back since birth.\nSteady and resilient.",
  },
  {
    speciesId: 4,
    name:  "Charmander",
    types: ["Fire"],
    desc:  "Its tail flame shows\nthe strength of its\nburning life force.",
  },
  {
    speciesId: 7,
    name:  "Squirtle",
    types: ["Water"],
    desc:  "Its shell deflects\nattacks and it fires\nwater at high speed.",
  },
];

const SPR_X: [number, number, number] = [120, 240, 360];
const SPR_Y = 148;
const HL_W  = 98;
const HL_H  = 142;
const HL_TOP = 68;

export class StarterScene extends Phaser.Scene {
  private cursors!:    Phaser.Types.Input.Keyboard.CursorKeys;
  private leftKey!:    Phaser.Input.Keyboard.Key;
  private rightKey!:   Phaser.Input.Keyboard.Key;
  private confirmKey!: Phaser.Input.Keyboard.Key;

  private selected  = 1; // start on Charmander (center)
  private sprites:    Phaser.GameObjects.Image[] = [];
  private highlight!: Phaser.GameObjects.Graphics;
  private nameText!:  Phaser.GameObjects.Text;
  private descText!:  Phaser.GameObjects.Text;
  private badges:     Phaser.GameObjects.Text[] = [];
  private canInput  = false;
  private confirmed = false;

  constructor() { super({ key: "StarterScene" }); }

  create() {
    const W = this.scale.width;   // 480
    const H = this.scale.height;  // 320

    // ── Background ───────────────────────────────────────────────────────────
    this.add.rectangle(0, 0, W, H, 0x08091a).setOrigin(0);

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
    gndGfx.fillRect(0, H - 30, W, 30);
    gndGfx.lineStyle(1, 0x1a2255, 1);
    gndGfx.strokeRect(0, H - 30, W, 1);

    // Card panel behind starters
    const card = this.add.graphics();
    card.fillStyle(0x0c1030, 0.7);
    card.fillRoundedRect(34, 60, W - 68, 170, 8);
    card.lineStyle(1, 0x1e2f88, 0.55);
    card.strokeRoundedRect(34, 60, W - 68, 170, 8);

    // Shadow ellipses under each sprite (grounding)
    const shadowGfx = this.add.graphics();
    shadowGfx.fillStyle(0x000000, 0.22);
    for (const x of SPR_X) shadowGfx.fillEllipse(x, 216, 78, 10);

    // ── Title ────────────────────────────────────────────────────────────────
    this.add.text(W / 2, 20, "CHOOSE YOUR STARTER", {
      fontSize: "13px", color: "#ddeeff",
      fontFamily: "monospace", fontStyle: "bold",
    }).setOrigin(0.5).setDepth(2);

    this.add.text(W / 2, 38, "Your Pokémon companion awaits.", {
      fontSize: "9px", color: "#374466", fontFamily: "monospace",
    }).setOrigin(0.5).setDepth(2);

    // ── Highlight box ────────────────────────────────────────────────────────
    this.highlight = this.add.graphics().setDepth(3);

    // ── Pokémon sprites ──────────────────────────────────────────────────────
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

    this.descText = this.add.text(W / 2, 270, "", {
      fontSize: "9px", color: "#5e6e99",
      fontFamily: "monospace", align: "center",
    }).setOrigin(0.5).setDepth(5);

    // ── Controls hint ────────────────────────────────────────────────────────
    this.add.text(W / 2, 307, "◄  A / Left     Right / D  ►          Z  Select", {
      fontSize: "8px", color: "#252e4a", fontFamily: "monospace",
    }).setOrigin(0.5).setDepth(5);

    // ── Input ────────────────────────────────────────────────────────────────
    this.cursors    = this.input.keyboard!.createCursorKeys();
    this.leftKey    = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightKey   = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.confirmKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

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

    if (goLeft)  { this.selected = (this.selected + 2) % 3; this.refreshDisplay(); }
    if (goRight) { this.selected = (this.selected + 1) % 3; this.refreshDisplay(); }

    if (Phaser.Input.Keyboard.JustDown(this.confirmKey)) this.confirm();
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private refreshDisplay(): void {
    const W       = this.scale.width;
    const starter = STARTERS[this.selected];
    const hx      = SPR_X[this.selected];

    // Highlight glow
    this.highlight.clear();
    this.highlight.fillStyle(0x2244cc, 0.16);
    this.highlight.fillRoundedRect(hx - HL_W / 2, HL_TOP, HL_W, HL_H, 7);
    this.highlight.lineStyle(2, 0x4488ff, 0.88);
    this.highlight.strokeRoundedRect(hx - HL_W / 2, HL_TOP, HL_W, HL_H, 7);

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

    // Type badges — centered, 1 or 2 types
    const types = starter.types;
    const bPositions = types.length === 1
      ? [W / 2]
      : [W / 2 - 32, W / 2 + 32];

    for (let i = 0; i < 2; i++) {
      if (i < types.length) {
        this.badges[i]
          .setText(types[i].toUpperCase())
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

    this.nameText.setText(`You chose ${starter.name}!`).setColor("#ffdd88");
    this.descText.setText("Good luck on your adventure!");

    this.cameras.main.flash(220, 255, 255, 255, true);
    this.time.delayedCall(680, () => {
      this.cameras.main.fadeOut(380, 0, 0, 0);
    });
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("WorldScene");
    });
  }
}
