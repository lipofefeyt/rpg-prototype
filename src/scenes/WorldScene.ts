import Phaser from "phaser";
import {
  TILE_SIZE,
  MAP_COLS, MAP_ROWS, PATH_ROW, PATH_COL,
  TILE_GRASS, TILE_TREE, TILE_PATH, TILE_WATER,
} from "@/constants";

const MOVE_DURATION = 150; // ms per tile — matches Gen 3 walk speed

export type Direction = "up" | "down" | "left" | "right";

const DIR_DELTA: Record<Direction, { dx: number; dy: number }> = {
  up:    { dx:  0, dy: -1 },
  down:  { dx:  0, dy:  1 },
  left:  { dx: -1, dy:  0 },
  right: { dx:  1, dy:  0 },
};

// Animation frame base per direction (frame = base + 0/1/2)
const ANIM_BASE: Record<Direction, number> = { down: 0, up: 3, left: 6, right: 9 };

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<Direction, Phaser.Input.Keyboard.Key>;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;

  // Grid position (tile coordinates, not world pixels)
  private tileX = PATH_COL;
  private tileY = PATH_ROW;

  direction: Direction = "down";
  isMoving = false;

  constructor() {
    super({ key: "WorldScene" });
  }

  create() {
    // ── Tilemap ────────────────────────────────────────────────────────────
    const map = this.make.tilemap({
      data: this.buildMap(),
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });

    // Texture was generated in BootScene and lives in the global TextureManager
    const tileset = map.addTilesetImage("tileset");
    if (!tileset) throw new Error("Tileset texture not found — did BootScene run?");

    this.groundLayer = map.createLayer(0, tileset, 0, 0)!;

    // ── Player sprite ──────────────────────────────────────────────────────
    this.player = this.add.sprite(
      this.tileX * TILE_SIZE + TILE_SIZE / 2,
      this.tileY * TILE_SIZE + TILE_SIZE / 2,
      "player",
      0,
    ).setDepth(1);

    this.registerAnimations();

    // ── Camera ─────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setDeadzone(TILE_SIZE / 2, TILE_SIZE / 2);

    // ── Input ──────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    this.scene.launch("UIScene");
  }

  update() {
    if (this.isMoving) return;
    const dir = this.readInput();
    if (dir) this.tryStep(dir);
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private registerAnimations() {
    const dirs: Direction[] = ["down", "up", "left", "right"];
    for (const dir of dirs) {
      const b = ANIM_BASE[dir];
      this.anims.create({
        key: `walk-${dir}`,
        frames: this.anims.generateFrameNumbers("player", { frames: [b, b + 1, b, b + 2] }),
        frameRate: 8,
        repeat: -1,
      });
      this.anims.create({
        key: `idle-${dir}`,
        frames: this.anims.generateFrameNumbers("player", { start: b, end: b }),
        frameRate: 1,
        repeat: 0,
      });
    }
    this.player.play("idle-down");
  }

  private readInput(): Direction | null {
    if (this.cursors.up.isDown    || this.wasd.up.isDown)    return "up";
    if (this.cursors.down.isDown  || this.wasd.down.isDown)  return "down";
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  return "left";
    if (this.cursors.right.isDown || this.wasd.right.isDown) return "right";
    return null;
  }

  private isWalkable(tx: number, ty: number): boolean {
    const tile = this.groundLayer.getTileAt(tx, ty);
    if (!tile) return false;
    return tile.index === TILE_GRASS || tile.index === TILE_PATH;
  }

  private tryStep(dir: Direction) {
    this.direction = dir;
    const { dx, dy } = DIR_DELTA[dir];
    const nx = this.tileX + dx;
    const ny = this.tileY + dy;

    // Always face the attempted direction, even if blocked
    this.player.play(`idle-${dir}`, true);

    if (!this.isWalkable(nx, ny)) return;

    this.tileX = nx;
    this.tileY = ny;
    this.isMoving = true;

    this.player.play(`walk-${dir}`, true);

    this.tweens.add({
      targets: this.player,
      x: this.tileX * TILE_SIZE + TILE_SIZE / 2,
      y: this.tileY * TILE_SIZE + TILE_SIZE / 2,
      duration: MOVE_DURATION,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
        this.player.play(`idle-${this.direction}`, true);
      },
    });
  }

  // Procedural placeholder map (50×40 tiles).
  // Replace with this.make.tilemap({ key: 'overworld' }) once Tiled assets exist.
  private buildMap(): number[][] {
    const G = TILE_GRASS, T = TILE_TREE, P = TILE_PATH, W = TILE_WATER;
    const m = Array.from({ length: MAP_ROWS }, () => Array<number>(MAP_COLS).fill(G));

    // Solid border
    for (let x = 0; x < MAP_COLS; x++) { m[0][x] = T; m[MAP_ROWS - 1][x] = T; }
    for (let y = 0; y < MAP_ROWS; y++) { m[y][0] = T; m[y][MAP_COLS - 1] = T; }

    // Cross-roads paths
    for (let x = 1; x < MAP_COLS - 1; x++) m[PATH_ROW][x] = P;
    for (let y = 1; y < MAP_ROWS - 1; y++) m[y][PATH_COL] = P;

    // Tree groves (4 corners + scatter)
    const trees: [number, number][] = [
      // TL grove
      [3,3],[4,3],[5,3],[3,4],[5,4],[3,5],[4,5],[5,5],
      // TR grove
      [43,3],[44,3],[45,3],[43,4],[45,4],[43,5],[44,5],[45,5],
      // BL grove
      [3,33],[4,33],[5,33],[3,34],[5,34],[3,35],[4,35],[5,35],
      // BR grove
      [43,33],[44,33],[45,33],[43,34],[45,34],[43,35],[44,35],[45,35],
      // Scattered clumps
      [10,6],[11,6],[10,7],[11,7],[12,7],
      [30,8],[31,8],[30,9],
      [13,27],[14,27],[13,28],[14,28],[13,29],
      [35,26],[36,26],[35,27],
      [8,14],[9,14],[8,15],[8,16],   // west of crossroads
      [40,22],[41,22],[40,23],[41,23],
    ];
    for (const [tx, ty] of trees) {
      if (ty > 0 && ty < MAP_ROWS - 1 && tx > 0 && tx < MAP_COLS - 1 && m[ty][tx] !== P) {
        m[ty][tx] = T;
      }
    }

    // Water lakes
    for (let y = 3; y <= 12; y++)      // top-right lake
      for (let x = 32; x <= 41; x++)
        if (m[y][x] !== T && m[y][x] !== P) m[y][x] = W;

    for (let y = 27; y <= 32; y++)     // bottom-left lake
      for (let x = 8; x <= 16; x++)
        if (m[y][x] !== T && m[y][x] !== P) m[y][x] = W;

    return m;
  }
}
