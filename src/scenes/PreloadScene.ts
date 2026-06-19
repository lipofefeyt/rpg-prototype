import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    const { width: W, height: H } = this.scale;

    // ── Loading screen ───────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x0d0d1a);

    this.add.text(W / 2, H / 2 - 40, "RPG PROTOTYPE", {
      fontSize: "16px",
      color: "#aaccff",
      fontFamily: "monospace",
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Progress bar
    this.add.rectangle(W / 2, H / 2 + 10, 200, 12, 0x1a1a3a);
    const bar = this.add
      .rectangle(W / 2 - 100, H / 2 + 10, 0, 8, 0x4488ff)
      .setOrigin(0, 0.5);

    const label = this.add.text(W / 2, H / 2 + 28, "Loading…", {
      fontSize: "9px",
      color: "#556688",
      fontFamily: "monospace",
    }).setOrigin(0.5);

    this.load.on("progress", (v: number) => {
      bar.width = 200 * v;
    });
    this.load.on("filedone", (_key: string, file: { key: string }) => {
      label.setText(file.key);
    });

    // ── Asset loads go here when real files are ready ────────────────────────
    // this.load.tilemapTiledJSON("overworld", "assets/maps/overworld.json");
    // this.load.image("overworld-tiles", "assets/tilesets/overworld.png");
    // this.load.spritesheet("player", "assets/sprites/player.png", { frameWidth: 16, frameHeight: 16 });
    // this.load.audio("bgm-town", "assets/audio/town.ogg");
  }

  create() {
    this.scene.start("WorldScene");
  }
}
