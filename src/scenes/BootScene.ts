import Phaser from "phaser";

// Tileset  — 32×32 texture, 2×2 grid of 16×16 tiles
//   index 0: grass   index 1: tree
//   index 2: path    index 3: water
//
// Player spritesheet — 48×64 texture, 3 cols × 4 rows of 16×16 frames
//   col:   0 = idle   1 = walkA   2 = walkB
//   row 0: facing DOWN
//   row 1: facing UP
//   row 2: facing LEFT
//   row 3: facing RIGHT
//
// Frame number = row * 3 + col  →  DOWN-idle=0 … RIGHT-walkB=11

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create() {
    this.generateTileset();
    this.generatePlayerSprites();
    this.scene.start("PreloadScene");
  }

  // ── Tileset ──────────────────────────────────────────────────────────────

  private generateTileset() {
    const g = this.add.graphics();

    // Tile 0 — Grass
    g.fillStyle(0x568c34);
    g.fillRect(0, 0, 16, 16);
    g.fillStyle(0x4a7c2c);
    for (let row = 0; row < 2; row++)
      for (let col = 0; col < 2; col++)
        if ((row + col) % 2 === 0) g.fillRect(col * 8, row * 8, 8, 8);

    // Tile 1 — Tree
    g.fillStyle(0x2d5a0e);
    g.fillRect(16, 0, 16, 16);
    g.fillStyle(0x3d7a1e);
    g.fillRect(19, 2, 10, 9);
    g.fillRect(17, 4, 14, 5);
    g.fillStyle(0x6b3a1f);
    g.fillRect(22, 11, 4, 5);

    // Tile 2 — Path
    g.fillStyle(0xc8a878);
    g.fillRect(0, 16, 16, 16);
    g.fillStyle(0xb89868);
    g.fillRect(0, 20, 16, 1);
    g.fillRect(0, 25, 16, 1);
    g.fillStyle(0xd8b888);
    g.fillRect(3, 18, 2, 2);
    g.fillRect(10, 23, 2, 2);

    // Tile 3 — Water
    g.fillStyle(0x2277aa);
    g.fillRect(16, 16, 16, 16);
    g.fillStyle(0x44aacc);
    g.fillRect(18, 20, 10, 2);
    g.fillRect(20, 26, 10, 2);
    g.fillStyle(0x66bbdd);
    g.fillRect(26, 18, 2, 2);

    // Tile 4 — Tall Grass (encounter zone) — index (col=0, row=2) in 2×3 tileset
    g.fillStyle(0x3a6518);
    g.fillRect(0, 32, 16, 16);
    // Grass blade clusters
    g.fillStyle(0x5aa030);
    g.fillRect(1, 42, 2, 6); g.fillRect(3, 40, 2, 8);
    g.fillRect(6, 38, 2, 10); g.fillRect(8, 41, 2, 7);
    g.fillRect(11, 39, 2, 9); g.fillRect(13, 42, 2, 6);
    // Dark tips
    g.fillStyle(0x285010);
    g.fillRect(1, 42, 2, 1); g.fillRect(3, 40, 2, 1);
    g.fillRect(6, 38, 2, 1); g.fillRect(8, 41, 2, 1);
    g.fillRect(11, 39, 2, 1); g.fillRect(13, 42, 2, 1);

    g.generateTexture("tileset", 32, 48); // 2×3 tile grid
    g.destroy();
  }

  // ── Player spritesheet ────────────────────────────────────────────────────

  private generatePlayerSprites() {
    const SKIN = 0xffd5ab;
    const HAIR = 0x5c3317;
    const EYE  = 0x1a1a4e;
    const SHRT = 0x3366dd;
    const PNT  = 0x224488;
    const SHO  = 0x1a1005;
    const DARK = 0x2a1a08; // shadow / outline hint

    const g = this.add.graphics();

    // Helper: fill rect at (ox+x, oy+y)
    const R = (c: number, ox: number, oy: number, x: number, y: number, w: number, h: number) => {
      g.fillStyle(c);
      g.fillRect(ox + x, oy + y, w, h);
    };

    // Walking foot positions: [frame, leftFootY, rightFootY] (relative to frame top)
    const WALK: [number, number, number][] = [
      [0, 15, 15], // idle
      [1, 14, 15], // walkA: left foot raised
      [2, 15, 14], // walkB: right foot raised
    ];

    // ── DOWN (row 0, oy = 0) ─────────────────────────────────────────────
    for (const [f, lY, rY] of WALK) {
      const ox = f * 16, oy = 0;
      R(DARK, ox, oy,  3,  0,  10, 2);  // hair shadow
      R(HAIR, ox, oy,  4,  0,   8, 3);
      R(HAIR, ox, oy,  3,  1,  10, 2);
      R(SKIN, ox, oy,  3,  2,  10, 6);  // face
      R(EYE,  ox, oy,  5,  4,   2, 2);  // L eye
      R(EYE,  ox, oy,  9,  4,   2, 2);  // R eye
      R(SKIN, ox, oy,  6,  8,   4, 1);  // neck
      R(SHRT, ox, oy,  3,  9,  10, 3);  // shirt
      R(DARK, ox, oy,  3,  9,   1, 3);  // shirt shadow L
      R(DARK, ox, oy, 12,  9,   1, 3);  // shirt shadow R
      R(SKIN, ox, oy,  0,  9,   3, 4);  // L arm
      R(SKIN, ox, oy, 13,  9,   3, 4);  // R arm
      R(PNT,  ox, oy,  4, 12,   3, lY - 12); R(SHO, ox, oy, 4, lY, 3, 1);
      R(PNT,  ox, oy,  9, 12,   3, rY - 12); R(SHO, ox, oy, 9, rY, 3, 1);
    }

    // ── UP (row 1, oy = 16) ──────────────────────────────────────────────
    for (const [f, lY, rY] of WALK) {
      const ox = f * 16, oy = 16;
      R(DARK, ox, oy,  2,  0,  12, 2);  // hair outline
      R(HAIR, ox, oy,  3,  0,  10, 7);  // full back-of-head hair
      R(HAIR, ox, oy,  2,  1,  12, 5);
      R(SKIN, ox, oy,  4,  4,   8, 4);  // back of neck / ear hint
      R(SKIN, ox, oy,  6,  8,   4, 1);
      R(SHRT, ox, oy,  3,  9,  10, 3);
      R(DARK, ox, oy,  3,  9,   1, 3);
      R(DARK, ox, oy, 12,  9,   1, 3);
      R(SKIN, ox, oy,  0,  9,   3, 4);
      R(SKIN, ox, oy, 13,  9,   3, 4);
      R(PNT,  ox, oy,  4, 12,   3, lY - 12); R(SHO, ox, oy, 4, lY, 3, 1);
      R(PNT,  ox, oy,  9, 12,   3, rY - 12); R(SHO, ox, oy, 9, rY, 3, 1);
    }

    // ── LEFT (row 2, oy = 32) ────────────────────────────────────────────
    for (const [f, fY, bY] of WALK) {
      const ox = f * 16, oy = 32;
      // Head profile facing left (nose points left = toward x=0)
      R(DARK, ox, oy,  3,  0,   8, 2);
      R(HAIR, ox, oy,  4,  0,   7, 4);  // hair (back/right side)
      R(HAIR, ox, oy,  5,  1,   6, 4);
      R(SKIN, ox, oy,  3,  2,   8, 6);  // face
      R(EYE,  ox, oy,  4,  4,   2, 2);  // near eye
      R(SKIN, ox, oy,  3,  5,   1, 2);  // nose
      R(SKIN, ox, oy,  6,  8,   4, 1);
      R(SHRT, ox, oy,  4,  9,   8, 3);
      R(DARK, ox, oy,  4,  9,   1, 3);
      // Swing arm (near arm, on right side of frame)
      const aY = f === 1 ? oy + 10 : f === 2 ? oy + 8 : oy + 9;
      R(SKIN, 0, 0, ox + 12, aY, 3, 3);
      // Legs side view: front leg left in frame, back leg right
      R(PNT,  ox, oy,  5, 12, 3, fY - 12); R(SHO, ox, oy, 5, fY, 3, 1);
      R(PNT,  ox, oy,  9, 12, 3, bY - 12); R(SHO, ox, oy, 9, bY, 3, 1);
    }

    // ── RIGHT (row 3, oy = 48) ───────────────────────────────────────────
    for (const [f, fY, bY] of WALK) {
      const ox = f * 16, oy = 48;
      R(DARK, ox, oy,  5,  0,   8, 2);
      R(HAIR, ox, oy,  5,  0,   7, 4);
      R(HAIR, ox, oy,  5,  1,   6, 4);
      R(SKIN, ox, oy,  5,  2,   8, 6);
      R(EYE,  ox, oy, 10,  4,   2, 2);  // near eye
      R(SKIN, ox, oy, 12,  5,   1, 2);  // nose
      R(SKIN, ox, oy,  6,  8,   4, 1);
      R(SHRT, ox, oy,  4,  9,   8, 3);
      R(DARK, ox, oy, 11,  9,   1, 3);
      const aY = f === 1 ? oy + 10 : f === 2 ? oy + 8 : oy + 9;
      R(SKIN, 0, 0, ox + 1, aY, 3, 3);
      R(PNT,  ox, oy,  8, 12, 3, fY - 12); R(SHO, ox, oy, 8, fY, 3, 1);
      R(PNT,  ox, oy,  5, 12, 3, bY - 12); R(SHO, ox, oy, 5, bY, 3, 1);
    }

    g.generateTexture("player", 48, 64);
    g.destroy();

    // Slice the texture into named frames so Phaser animations can reference them
    const tex = this.textures.get("player");
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 3; col++) {
        tex.add(row * 3 + col, 0, col * 16, row * 16, 16, 16);
      }
    }
  }
}
