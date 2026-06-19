import Phaser from "phaser";

// Tileset — 32×48 texture, 2 cols × 3 rows of 16×16 tiles
//   0: grass  1: tree  2: path  3: water  4: tall-grass  5: cave-floor
//
// Character spritesheets — 48×64 texture, 3 frames × 4 directions, each 16×16
//   col 0=idle  col 1=walkA  col 2=walkB
//   row 0=down  row 1=up     row 2=left  row 3=right
//   frame index = row*3 + col  (DOWN-idle=0 … RIGHT-walkB=11)

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  create() {
    this.genTileset();
    this.genPlayerSheet();
    this.genNpcSheet("npc-elder",    (g, ox, oy, d) => this.drawElder(g, ox, oy, d));
    this.genNpcSheet("npc-guard",    (g, ox, oy, d) => this.drawGuard(g, ox, oy, d));
    this.genNpcSheet("npc-merchant", (g, ox, oy, d) => this.drawMerchant(g, ox, oy, d));
    this.genNpcSheet("npc-miner",    (g, ox, oy, d) => this.drawMiner(g, ox, oy, d));
    this.scene.start("PreloadScene");
  }

  // ── Tileset ──────────────────────────────────────────────────────────────────

  private genTileset(): void {
    const g = this.add.graphics();
    const R = (c: number, x: number, y: number, w: number, h: number) => {
      g.fillStyle(c); g.fillRect(x, y, w, h);
    };

    // Tile 0 — Grass (natural scattered texture, no checkerboard)
    R(0x558c32,  0,  0, 16, 16);
    R(0x68aa3e,  0,  0,  4,  3); R(0x68aa3e,  7,  1,  5,  2);
    R(0x68aa3e, 13,  4,  3,  4); R(0x68aa3e,  1,  8,  3,  3);
    R(0x68aa3e,  5, 10,  4,  2); R(0x68aa3e, 10, 12,  5,  3);
    R(0x3d6820,  0,  5,  2,  4); R(0x3d6820,  5,  6,  3,  3);
    R(0x3d6820, 10,  7,  2,  3); R(0x3d6820,  3, 13,  4,  3);
    R(0x7fd052,  2,  1,  1,  1); R(0x7fd052,  9,  3,  1,  1);
    R(0x7fd052, 14,  8,  1,  1); R(0x7fd052,  6, 12,  1,  1);

    // Tile 1 — Tree (layered canopy + trunk)
    R(0x1e4a0a, 16,  0, 16, 16);
    R(0x2e6a14, 18,  0, 12,  5); R(0x3a7c1e, 17,  3, 14,  6);
    R(0x2e6a14, 19,  8, 10,  4);
    R(0x4a9a2c, 20,  1,  3,  2); R(0x4a9a2c, 26,  2,  4,  2);
    R(0x4a9a2c, 22,  5,  3,  2); R(0x4a9a2c, 19,  8,  2,  2);
    R(0x4a9a2c, 27,  7,  2,  3);
    R(0x7a4a1a, 22, 11,  4,  5); R(0x5a3a0a, 22, 11,  1,  5);

    // Tile 2 — Path (warm dirt with groove lines and pebbles)
    R(0xc0a070,  0, 16, 16, 16);
    R(0xa08858,  0, 19, 16,  1); R(0xa08858,  0, 24, 16,  1);
    R(0xa08858,  0, 29, 16,  1);
    R(0xd4b880,  0, 16, 16,  1); R(0xd4b880,  1, 18,  3,  2);
    R(0xd4b880, 10, 23,  2,  2); R(0xd4b880,  5, 27,  3,  1);
    R(0x907050,  4, 20,  1,  1); R(0x907050, 11, 17,  1,  1);
    R(0x907050,  2, 26,  1,  1); R(0x907050, 13, 25,  1,  1);

    // Tile 3 — Water (deep blue with waves and sparkles)
    R(0x1a5a88, 16, 16, 16, 16); R(0x1a6899, 16, 16, 16,  5);
    R(0x3088bb, 17, 19,  8,  1); R(0x3088bb, 23, 21,  7,  1);
    R(0x3088bb, 17, 23,  5,  1); R(0x3088bb, 22, 26,  8,  1);
    R(0x3088bb, 16, 28,  6,  1);
    R(0x99ddef, 26, 17,  1,  1); R(0x99ddef, 21, 20,  1,  1);
    R(0x99ddef, 16, 25,  1,  1); R(0x99ddef, 29, 24,  1,  1);
    R(0x0f3a55, 16, 29, 16,  3);

    // Tile 4 — Tall Grass (encounter zone, blade clusters)
    R(0x3a6518,  0, 32, 16, 16);
    R(0x5aa030,  1, 42,  2,  6); R(0x5aa030,  3, 40,  2,  8);
    R(0x5aa030,  6, 38,  2, 10); R(0x5aa030,  8, 41,  2,  7);
    R(0x5aa030, 11, 39,  2,  9); R(0x5aa030, 13, 42,  2,  6);
    R(0x78cc44,  1, 42,  2,  1); R(0x78cc44,  3, 40,  2,  1);
    R(0x78cc44,  6, 38,  2,  1); R(0x78cc44,  8, 41,  2,  1);
    R(0x78cc44, 11, 39,  2,  1); R(0x78cc44, 13, 42,  2,  1);

    // Tile 5 — Cave Floor (dark stone, used inside cave zone)
    R(0x2a2535, 16, 32, 16, 16);
    R(0x3a3545, 16, 33,  6,  4); R(0x3a3545, 24, 36,  7,  5);
    R(0x3a3545, 17, 41,  5,  4); R(0x3a3545, 25, 43,  6,  4);
    R(0x1a1525, 19, 32,  1,  5); R(0x1a1525, 16, 38,  7,  1);
    R(0x1a1525, 27, 35,  1,  6); R(0x1a1525, 22, 41,  1,  7);
    R(0x4a4555, 16, 32, 16,  1); R(0x4a4555, 16, 38,  6,  1);

    g.generateTexture("tileset", 32, 48);
    g.destroy();
  }

  // ── Player spritesheet ────────────────────────────────────────────────────────
  // "Red"-style trainer: red cap, blue jacket, dark navy pants

  private genPlayerSheet(): void {
    const CAP  = 0xcc2222; // red cap
    const BRIM = 0xd4c4a0; // off-white brim
    const HAIR = 0x100808; // dark hair under cap
    const SKIN = 0xf5c48c;
    const EYE  = 0x202038;
    const SHRT = 0x2255cc; // blue jacket
    const SACC = 0x1040a0; // darker jacket side panels
    const PANT = 0x1a2a70; // navy pants
    const SHOE = 0x888888;

    const g = this.add.graphics();
    const R = (c: number, ox: number, oy: number, x: number, y: number, w: number, h: number) => {
      g.fillStyle(c); g.fillRect(ox + x, oy + y, w, h);
    };

    // [frame, leftFootY, rightFootY]
    const WALK: [number, number, number][] = [[0, 15, 15], [1, 14, 15], [2, 15, 14]];

    // ── DOWN (row 0, oy=0) ───────────────────────────────────────────────────
    for (const [f, lY, rY] of WALK) {
      const ox = f * 16, oy = 0;
      R(CAP,  ox,oy,  2, 0, 12, 2); R(CAP,  ox,oy, 1, 1, 14, 1);
      R(BRIM, ox,oy,  1, 2, 14, 1);
      R(HAIR, ox,oy,  1, 1,  2, 2); R(HAIR, ox,oy, 13, 1,  2, 2);
      R(SKIN, ox,oy,  3, 3, 10, 4);
      R(EYE,  ox,oy,  5, 4,  2, 2); R(EYE,  ox,oy,  9, 4,  2, 2);
      R(SKIN, ox,oy,  6, 7,  4, 1);
      R(SHRT, ox,oy,  1, 7, 14, 5);
      R(SACC, ox,oy,  1, 9,  2, 2); R(SACC, ox,oy, 13, 9,  2, 2);
      R(SKIN, ox,oy,  0, 7,  1, 5); R(SKIN, ox,oy, 15, 7,  1, 5);
      R(PANT, ox,oy,  3,12,  4, lY - 12);
      R(PANT, ox,oy,  9,12,  4, rY - 12);
      R(SHOE, ox,oy,  2, lY,  5, 1);
      R(SHOE, ox,oy,  9, rY,  5, 1);
    }

    // ── UP (row 1, oy=16) ────────────────────────────────────────────────────
    for (const [f, lY, rY] of WALK) {
      const ox = f * 16, oy = 16;
      R(CAP,  ox,oy,  2, 0, 12, 3);
      R(HAIR, ox,oy,  2, 1, 12, 6); R(HAIR, ox,oy, 1, 2, 14, 4);
      R(SKIN, ox,oy,  6, 7,  4, 1);
      R(SHRT, ox,oy,  1, 7, 14, 5);
      R(SACC, ox,oy,  1, 9,  2, 2); R(SACC, ox,oy, 13, 9,  2, 2);
      R(SKIN, ox,oy,  0, 7,  1, 5); R(SKIN, ox,oy, 15, 7,  1, 5);
      R(PANT, ox,oy,  3,12,  4, lY - 12);
      R(PANT, ox,oy,  9,12,  4, rY - 12);
      R(SHOE, ox,oy,  2, lY,  5, 1);
      R(SHOE, ox,oy,  9, rY,  5, 1);
    }

    // ── LEFT (row 2, oy=32) ──────────────────────────────────────────────────
    for (const [f, fY, bY] of WALK) {
      const ox = f * 16, oy = 32;
      R(CAP,  ox,oy,  3, 0, 10, 3); R(BRIM, ox,oy, 1, 2, 14, 1);
      R(HAIR, ox,oy,  3, 1,  2, 2);
      R(SKIN, ox,oy,  2, 3,  9, 4);
      R(EYE,  ox,oy,  3, 4,  2, 2);
      R(SKIN, ox,oy,  5, 7,  4, 1);
      R(SHRT, ox,oy,  3, 7, 10, 5);
      const aY = f === 1 ? oy + 10 : f === 2 ? oy + 8 : oy + 9;
      R(SKIN, 0, 0, ox + 13, aY, 2, 3);
      R(PANT, ox,oy,  5,12,  4, fY - 12);
      R(PANT, ox,oy,  8,12,  3, bY - 12);
      R(SHOE, ox,oy,  4, fY,  5, 1);
      R(SHOE, ox,oy,  7, bY,  4, 1);
    }

    // ── RIGHT (row 3, oy=48) ─────────────────────────────────────────────────
    for (const [f, fY, bY] of WALK) {
      const ox = f * 16, oy = 48;
      R(CAP,  ox,oy,  3, 0, 10, 3); R(BRIM, ox,oy, 1, 2, 14, 1);
      R(HAIR, ox,oy, 11, 1,  2, 2);
      R(SKIN, ox,oy,  5, 3,  9, 4);
      R(EYE,  ox,oy, 11, 4,  2, 2);
      R(SKIN, ox,oy,  7, 7,  4, 1);
      R(SHRT, ox,oy,  3, 7, 10, 5);
      const aY = f === 1 ? oy + 10 : f === 2 ? oy + 8 : oy + 9;
      R(SKIN, 0, 0, ox + 1, aY, 2, 3);
      R(PANT, ox,oy,  7,12,  4, fY - 12);
      R(PANT, ox,oy,  4,12,  3, bY - 12);
      R(SHOE, ox,oy,  7, fY,  4, 1);
      R(SHOE, ox,oy,  4, bY,  4, 1);
    }

    g.generateTexture("player", 48, 64);
    const tex = this.textures.get("player");
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 3; col++)
        tex.add(row * 3 + col, 0, col * 16, row * 16, 16, 16);
    g.destroy();
  }

  // ── NPC spritesheet factory ───────────────────────────────────────────────────

  private genNpcSheet(
    key: string,
    drawFn: (g: Phaser.GameObjects.Graphics, ox: number, oy: number, dir: number) => void,
  ): void {
    const g = this.add.graphics();
    for (let dir = 0; dir < 4; dir++)
      for (let frame = 0; frame < 3; frame++)
        drawFn(g, frame * 16, dir * 16, dir);
    g.generateTexture(key, 48, 64);
    const tex = this.textures.get(key);
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 3; col++)
        tex.add(row * 3 + col, 0, col * 16, row * 16, 16, 16);
    g.destroy();
  }

  // ── Elder (white sage robes, long silver hair) ────────────────────────────────

  private drawElder(g: Phaser.GameObjects.Graphics, ox: number, oy: number, dir: number): void {
    const R = (c: number, x: number, y: number, w: number, h: number) => {
      g.fillStyle(c); g.fillRect(ox + x, oy + y, w, h);
    };
    const HAIR = 0xdddde8; // silver-white hair
    const BERD = 0xbbbbcc; // gray beard
    const SKIN = 0xf0c080;
    const EYE  = 0x3060a0; // calm blue eyes
    const ROBE = 0x6644aa; // purple robe
    const RACC = 0x9966cc; // lighter robe highlight
    const SHOE = 0x333355;

    switch (dir) {
      case 0: // DOWN
        R(HAIR,  2, 0, 12, 2); R(HAIR,  1, 1, 14, 2);
        R(HAIR,  1, 2,  2, 4); R(HAIR, 13, 2,  2, 4); // side wisps
        R(SKIN,  3, 3, 10, 4);
        R(EYE,   5, 5,  2, 1); R(EYE,  9, 5,  2, 1);
        R(BERD,  4, 6,  8, 2);
        R(ROBE,  2, 8, 12, 7); R(RACC, 7, 8,  2, 5);
        R(SHOE,  5,15,  3, 1); R(SHOE, 8,15,  3, 1);
        break;
      case 1: // UP
        R(HAIR,  2, 0, 12, 2); R(HAIR,  1, 1, 14, 5);
        R(ROBE,  2, 7, 12, 8); R(RACC, 7, 8,  2, 5);
        R(SHOE,  5,15,  3, 1); R(SHOE, 8,15,  3, 1);
        break;
      case 2: // LEFT
        R(HAIR,  2, 0, 10, 3); R(HAIR,  1, 2, 12, 3);
        R(SKIN,  2, 3,  8, 4);
        R(EYE,   3, 5,  2, 1);
        R(BERD,  3, 6,  6, 2);
        R(ROBE,  2, 8, 10, 7);
        R(SHOE,  4,15,  4, 1);
        break;
      case 3: // RIGHT
        R(HAIR,  4, 0, 10, 3); R(HAIR,  3, 2, 12, 3);
        R(SKIN,  6, 3,  8, 4);
        R(EYE,  11, 5,  2, 1);
        R(BERD,  7, 6,  6, 2);
        R(ROBE,  4, 8, 10, 7);
        R(SHOE,  8,15,  4, 1);
        break;
    }
  }

  // ── Guard (steel helmet, blue-gray armor, red cape) ───────────────────────────

  private drawGuard(g: Phaser.GameObjects.Graphics, ox: number, oy: number, dir: number): void {
    const R = (c: number, x: number, y: number, w: number, h: number) => {
      g.fillStyle(c); g.fillRect(ox + x, oy + y, w, h);
    };
    const HELM = 0x8899aa; // steel
    const HACC = 0x6677aa; // helmet accent
    const SKIN = 0xf0b080;
    const EYE  = 0x202020;
    const ARMR = 0x445577; // dark armor
    const AACC = 0x6688aa; // armor highlight
    const CAPE = 0xcc2222; // red cape
    const BOOT = 0x222233;

    switch (dir) {
      case 0: // DOWN
        R(HELM,  1, 0, 14, 4); R(HACC,  1, 0, 14, 1); R(HACC,  7, 0,  2, 4);
        R(SKIN,  4, 3,  8, 3);
        R(EYE,   5, 4,  2, 2); R(EYE,  9, 4,  2, 2);
        R(CAPE,  0, 7,  2, 6); R(CAPE, 14, 7,  2, 6);
        R(ARMR,  2, 7, 12, 6); R(AACC,  5, 8,  6, 2);
        R(ARMR,  2,13, 12, 2);
        R(BOOT,  3,15,  4, 1); R(BOOT,  9,15,  4, 1);
        break;
      case 1: // UP
        R(HELM,  1, 0, 14, 5); R(HACC,  7, 0,  2, 5);
        R(CAPE,  0, 7,  2, 8); R(CAPE, 14, 7,  2, 8);
        R(ARMR,  2, 7, 12, 6); R(ARMR,  2,13, 12, 2);
        R(BOOT,  3,15,  4, 1); R(BOOT,  9,15,  4, 1);
        break;
      case 2: // LEFT
        R(HELM,  2, 0, 10, 5); R(HACC,  2, 0,  2, 5);
        R(SKIN,  3, 3,  6, 3);
        R(EYE,   4, 4,  2, 2);
        R(CAPE,  0, 7,  2, 7);
        R(ARMR,  2, 7,  9, 6); R(AACC,  4, 8,  4, 2);
        R(BOOT,  4,14,  4, 2);
        break;
      case 3: // RIGHT
        R(HELM,  4, 0, 10, 5); R(HACC, 12, 0,  2, 5);
        R(SKIN,  7, 3,  6, 3);
        R(EYE,  10, 4,  2, 2);
        R(CAPE, 14, 7,  2, 7);
        R(ARMR,  5, 7,  9, 6); R(AACC,  8, 8,  4, 2);
        R(BOOT,  8,14,  4, 2);
        break;
    }
  }

  // ── Merchant (wide brown hat, green coat, orange scarf) ───────────────────────

  private drawMerchant(g: Phaser.GameObjects.Graphics, ox: number, oy: number, dir: number): void {
    const R = (c: number, x: number, y: number, w: number, h: number) => {
      g.fillStyle(c); g.fillRect(ox + x, oy + y, w, h);
    };
    const HAT  = 0x7a4a1a; // brown hat crown
    const BRIM = 0x4a2a08; // dark hat brim
    const SKIN = 0xf5c090;
    const EYE  = 0x382818;
    const SCRF = 0xee7700; // orange scarf
    const COAT = 0x2a7a2a; // green coat
    const CACC = 0x1a5a1a; // coat shadow
    const PANT = 0x8a6a3a; // khaki
    const SHOE = 0x5a3a1a;

    switch (dir) {
      case 0: // DOWN
        R(BRIM,  0, 0, 16, 1);
        R(HAT,   2, 1, 12, 3);
        R(SKIN,  3, 4, 10, 4);
        R(EYE,   5, 5,  2, 2); R(EYE,  9, 5,  2, 2);
        R(SCRF,  4, 8,  8, 2);
        R(COAT,  2, 9, 12, 5); R(CACC,  2, 9,  1, 5); R(CACC, 13, 9,  1, 5);
        R(SKIN,  0, 9,  2, 4); R(SKIN, 14, 9,  2, 4);
        R(PANT,  3,14,  4, 2); R(PANT,  9,14,  4, 2);
        R(SHOE,  3,15,  4, 1); R(SHOE,  9,15,  4, 1);
        break;
      case 1: // UP
        R(BRIM,  0, 0, 16, 1);
        R(HAT,   2, 1, 12, 3);
        R(SCRF,  4, 8,  8, 2);
        R(COAT,  2, 9, 12, 5);
        R(SKIN,  0, 9,  2, 4); R(SKIN, 14, 9,  2, 4);
        R(PANT,  3,14,  4, 2); R(PANT,  9,14,  4, 2);
        R(SHOE,  3,15,  4, 1); R(SHOE,  9,15,  4, 1);
        break;
      case 2: // LEFT
        R(BRIM,  0, 0, 14, 1);
        R(HAT,   2, 1, 10, 3);
        R(SKIN,  2, 4,  8, 4);
        R(EYE,   3, 5,  2, 2);
        R(SCRF,  3, 8,  7, 2);
        R(COAT,  2, 9,  9, 5);
        R(PANT,  3,14,  4, 2); R(SHOE,  3,15,  4, 1);
        break;
      case 3: // RIGHT
        R(BRIM,  2, 0, 14, 1);
        R(HAT,   4, 1, 10, 3);
        R(SKIN,  6, 4,  8, 4);
        R(EYE,  11, 5,  2, 2);
        R(SCRF,  6, 8,  7, 2);
        R(COAT,  5, 9,  9, 5);
        R(PANT,  9,14,  4, 2); R(SHOE,  9,15,  4, 1);
        break;
    }
  }

  // ── Miner (yellow hard hat, goggles, brown work clothes) ─────────────────────

  private drawMiner(g: Phaser.GameObjects.Graphics, ox: number, oy: number, dir: number): void {
    const R = (c: number, x: number, y: number, w: number, h: number) => {
      g.fillStyle(c); g.fillRect(ox + x, oy + y, w, h);
    };
    const HAT  = 0xddaa00; // yellow hard hat
    const HACC = 0xbb8800; // hat brim darker shade
    const SKIN = 0xf0b078;
    const GOGL = 0x1a1a2a; // dark goggles
    const WORK = 0x7a5a30; // brown work clothes
    const WACC = 0x5a4020; // shadow
    const BELT = 0x4a3010; // tool belt
    const PANT = 0x4a3818; // dark cargo pants
    const BOOT = 0x1a1008;

    switch (dir) {
      case 0: // DOWN
        R(HACC,  1, 0, 14, 1);
        R(HAT,   3, 0, 10, 4); R(HAT,  1, 2, 14, 2);
        R(SKIN,  3, 4, 10, 4);
        R(GOGL,  4, 5,  3, 2); R(GOGL,  9, 5,  3, 2); R(GOGL,  7, 5,  2, 1);
        R(WORK,  1, 8, 14, 5); R(WACC,  1, 8,  1, 5); R(WACC, 14, 8,  1, 5);
        R(SKIN,  0, 8,  1, 4); R(SKIN, 15, 8,  1, 4);
        R(BELT,  2,13, 12, 1);
        R(PANT,  3,14,  4, 2); R(PANT,  9,14,  4, 2);
        R(BOOT,  3,15,  4, 1); R(BOOT,  9,15,  4, 1);
        break;
      case 1: // UP
        R(HACC,  1, 0, 14, 1); R(HAT,  1, 1, 14, 3);
        R(WORK,  1, 8, 14, 5);
        R(BELT,  2,13, 12, 1);
        R(PANT,  3,14,  4, 2); R(PANT,  9,14,  4, 2);
        R(BOOT,  3,15,  4, 1); R(BOOT,  9,15,  4, 1);
        break;
      case 2: // LEFT
        R(HACC,  1, 0, 11, 1); R(HAT,  2, 0, 10, 4);
        R(SKIN,  2, 4,  8, 4);
        R(GOGL,  3, 5,  3, 2);
        R(WORK,  2, 8,  9, 5);
        R(BELT,  3,13,  8, 1);
        R(PANT,  3,14,  4, 2); R(BOOT,  3,15,  4, 1);
        break;
      case 3: // RIGHT
        R(HACC,  4, 0, 11, 1); R(HAT,  4, 0, 10, 4);
        R(SKIN,  6, 4,  8, 4);
        R(GOGL, 10, 5,  3, 2);
        R(WORK,  5, 8,  9, 5);
        R(BELT,  5,13,  8, 1);
        R(PANT,  9,14,  4, 2); R(BOOT,  9,15,  4, 1);
        break;
    }
  }
}
