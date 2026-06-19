import Phaser from "phaser";

// Tileset layout (32×32, 2 columns × 2 rows of 16×16 tiles):
//   [0] grass  [1] tree
//   [2] path   [3] water

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create() {
    this.generateTileset();
    this.scene.start("PreloadScene");
  }

  private generateTileset() {
    const g = this.add.graphics();

    // ── Tile 0: Grass (x=0, y=0) ──────────────────────────────────────────
    g.fillStyle(0x568c34);
    g.fillRect(0, 0, 16, 16);
    // Checkerboard shadow for depth
    g.fillStyle(0x4a7c2c);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        if ((row + col) % 2 === 0) g.fillRect(col * 8, row * 8, 8, 8);
      }
    }

    // ── Tile 1: Tree (x=16, y=0) ──────────────────────────────────────────
    g.fillStyle(0x2d5a0e);
    g.fillRect(16, 0, 16, 16);
    g.fillStyle(0x3d7a1e); // lighter foliage circle
    g.fillRect(19, 2, 10, 9);
    g.fillRect(17, 4, 14, 5);
    g.fillStyle(0x6b3a1f); // trunk
    g.fillRect(22, 11, 4, 5);

    // ── Tile 2: Path/Dirt (x=0, y=16) ────────────────────────────────────
    g.fillStyle(0xc8a878);
    g.fillRect(0, 16, 16, 16);
    g.fillStyle(0xb89868); // subtle grooves
    g.fillRect(0, 20, 16, 1);
    g.fillRect(0, 25, 16, 1);
    g.fillStyle(0xd8b888); // highlight pebble
    g.fillRect(3, 18, 2, 2);
    g.fillRect(10, 23, 2, 2);

    // ── Tile 3: Water (x=16, y=16) ───────────────────────────────────────
    g.fillStyle(0x2277aa);
    g.fillRect(16, 16, 16, 16);
    g.fillStyle(0x44aacc); // wave lines
    g.fillRect(18, 20, 10, 2);
    g.fillRect(20, 26, 10, 2);
    g.fillStyle(0x66bbdd); // sparkle
    g.fillRect(26, 18, 2, 2);

    g.generateTexture("tileset", 32, 32);
    g.destroy();
  }
}
