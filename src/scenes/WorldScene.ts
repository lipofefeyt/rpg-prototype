import Phaser from "phaser";
import { type Direction } from "@/types";
import { TILE_SIZE, ANIM_BASE, MS_PER_GAME_MINUTE, TILE_GRASS, TILE_PATH, TILE_TALLGRASS, TILE_CAVE_FLOOR } from "@/constants";
import { ZONES, type ZoneDef, type NpcDef } from "@/data/zones";
import type { BattleInitData } from "@/scenes/BattleScene";
import { SCRIPTS } from "@/data/scripts";

const MOVE_DURATION = 150;

function pickByWeight<T extends { weight: number }>(pool: T[]): T {
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const entry of pool) { r -= entry.weight; if (r <= 0) return entry; }
  return pool[pool.length - 1];
}

const DIR_DELTA: Record<Direction, { dx: number; dy: number }> = {
  up:    { dx:  0, dy: -1 },
  down:  { dx:  0, dy:  1 },
  left:  { dx: -1, dy:  0 },
  right: { dx:  1, dy:  0 },
};

// ── Day/night overlay keyframes ───────────────────────────────────────────────
// Each entry describes the tinted overlay at a given hour.
// alpha=0 = invisible (full day); r/g/b = tint colour when visible.
interface OverlayKey { hour: number; alpha: number; r: number; g: number; b: number }
const OVERLAY: OverlayKey[] = [
  { hour:  0, alpha: 0.55, r:  0, g:  5, b: 45 }, // midnight
  { hour:  5, alpha: 0.38, r:  0, g: 10, b: 50 }, // pre-dawn
  { hour:  6, alpha: 0.18, r: 60, g: 10, b: 60 }, // sunrise purple
  { hour:  7, alpha: 0.08, r: 80, g: 30, b:  0 }, // morning amber
  { hour:  8, alpha: 0.00, r:  0, g:  0, b:  0 }, // full day
  { hour: 17, alpha: 0.00, r:  0, g:  0, b:  0 }, // late afternoon
  { hour: 18, alpha: 0.08, r: 80, g: 30, b:  0 }, // sunset amber
  { hour: 20, alpha: 0.25, r: 40, g:  0, b: 40 }, // dusk purple
  { hour: 21, alpha: 0.45, r:  0, g:  5, b: 50 }, // evening
  { hour: 24, alpha: 0.55, r:  0, g:  5, b: 45 }, // midnight (wraps to 0)
];

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<Direction, Phaser.Input.Keyboard.Key>;
  private actionKey!: Phaser.Input.Keyboard.Key;

  private tilemap!: Phaser.Tilemaps.Tilemap;
  private groundLayer!: Phaser.Tilemaps.TilemapLayer;
  private activeNpcs: Phaser.GameObjects.Sprite[] = [];
  private currentZone!: ZoneDef;
  private dayNightOverlay!: Phaser.GameObjects.Rectangle;

  // Grid position (tile coords)
  private tileX = 0;
  private tileY = 0;

  direction: Direction = "down";
  isMoving = false;
  private dialogueLocked = false;
  private requireZRelease = false; // Z must be released before interaction re-arms

  // Day/night clock
  private gameHour = 8; // start at 8am (clear day)
  private clockAccMs = 0;

  constructor() {
    super({ key: "WorldScene" });
  }

  create() {
    const startZone = ZONES["overworld"];
    this.tileX = startZone.defaultSpawnX;
    this.tileY = startZone.defaultSpawnY;

    // ── Player ──────────────────────────────────────────────────────────────
    this.player = this.add.sprite(
      this.tileX * TILE_SIZE + TILE_SIZE / 2,
      this.tileY * TILE_SIZE + TILE_SIZE / 2,
      "player",
      0,
    ).setDepth(2);

    // ── Zone (tilemap + NPCs) ────────────────────────────────────────────────
    this.setupZone(startZone);

    // ── Camera ──────────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true);
    this.cameras.main.setDeadzone(TILE_SIZE / 2, TILE_SIZE / 2);

    // ── Input ────────────────────────────────────────────────────────────────
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left:  this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.actionKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // ── Animations ───────────────────────────────────────────────────────────
    this.registerAnimations();
    this.player.play("idle-down");

    // ── Day/night overlay (fixed to screen, depth above world but below UI) ──
    const { width: W, height: H } = this.scale;
    this.dayNightOverlay = this.add
      .rectangle(0, 0, W, H, 0x000033, 0)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(10);

    // ── Global events ────────────────────────────────────────────────────────
    this.game.events.on("dialogue:done", () => {
      this.dialogueLocked = false;
      this.requireZRelease = true; // won't re-arm until player releases Z
    }, this);

    this.scene.launch("UIScene");
  }

  update(_time: number, delta: number) {
    this.updateDayNight(delta);

    if (this.dialogueLocked) return;

    if (this.requireZRelease) {
      if (!this.actionKey.isDown) this.requireZRelease = false;
    }

    if (!this.requireZRelease && !this.isMoving && Phaser.Input.Keyboard.JustDown(this.actionKey)) {
      this.tryInteract();
      return;
    }

    if (!this.isMoving) {
      const dir = this.readInput();
      if (dir) this.tryStep(dir);
    }
  }

  // ── Zone management ───────────────────────────────────────────────────────

  private setupZone(zone: ZoneDef): void {
    this.currentZone = zone;

    // Tear down previous zone
    if (this.tilemap) this.tilemap.destroy();
    for (const npc of this.activeNpcs) npc.destroy();
    this.activeNpcs = [];

    // Build tilemap from data array
    this.tilemap = this.make.tilemap({
      data: zone.mapData,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = this.tilemap.addTilesetImage("tileset");
    if (!tileset) throw new Error("Tileset not found");
    this.groundLayer = this.tilemap.createLayer(0, tileset, 0, 0)!;

    // Camera bounds
    this.cameras.main.setBounds(
      0, 0,
      this.tilemap.widthInPixels,
      this.tilemap.heightInPixels,
    );

    // Spawn NPCs
    for (const def of zone.npcs) {
      this.activeNpcs.push(this.spawnNpc(def));
    }
  }

  private transitionToZone(targetId: string, spawnX: number, spawnY: number): void {
    this.isMoving = true; // block input during transition
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.setupZone(ZONES[targetId]);
      this.tileX = spawnX;
      this.tileY = spawnY;
      this.player.setPosition(
        this.tileX * TILE_SIZE + TILE_SIZE / 2,
        this.tileY * TILE_SIZE + TILE_SIZE / 2,
      );
      this.player.play(`idle-${this.direction}`, true);
      this.cameras.main.fadeIn(200, 0, 0, 0);
      this.cameras.main.once("camerafadeincomplete", () => { this.isMoving = false; });
    });
  }

  // ── NPC ───────────────────────────────────────────────────────────────────

  private spawnNpc(def: NpcDef): Phaser.GameObjects.Sprite {
    const spriteKey = `npc-${def.id}`;
    const key = this.textures.exists(spriteKey) ? spriteKey : "player";
    const spr = this.add.sprite(
      def.tileX * TILE_SIZE + TILE_SIZE / 2,
      def.tileY * TILE_SIZE + TILE_SIZE / 2,
      key,
      ANIM_BASE[def.facing],
    ).setDepth(1);
    if (key === "player") spr.setTint(def.tint);
    return spr;
  }

  // ── Movement ──────────────────────────────────────────────────────────────

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
    return tile.index === TILE_GRASS || tile.index === TILE_PATH
        || tile.index === TILE_TALLGRASS || tile.index === TILE_CAVE_FLOOR;
  }

  private tryStep(dir: Direction): void {
    this.direction = dir;
    this.player.play(`idle-${dir}`, true);

    const { dx, dy } = DIR_DELTA[dir];
    const nx = this.tileX + dx;
    const ny = this.tileY + dy;

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
        this.checkTransition();
        this.checkEncounter();
      },
    });
  }

  // ── Interaction ───────────────────────────────────────────────────────────

  private tryInteract(): void {
    const { dx, dy } = DIR_DELTA[this.direction];
    const tx = this.tileX + dx;
    const ty = this.tileY + dy;

    // Check NPCs
    const npc = this.currentZone.npcs.find(n => n.tileX === tx && n.tileY === ty);
    if (npc) {
      this.showDialogue(SCRIPTS[npc.scriptId] ?? [`[Missing script: ${npc.scriptId}]`], npc.name);
      return;
    }

    // Check signs
    const sign = this.currentZone.signs.find(s => s.tileX === tx && s.tileY === ty);
    if (sign) {
      this.showDialogue(SCRIPTS[sign.scriptId] ?? [`[Missing script: ${sign.scriptId}]`]);
    }
  }

  private showDialogue(pages: string[], speaker?: string): void {
    this.dialogueLocked = true;
    this.game.events.emit("dialogue:show", { pages, speaker });
  }

  // ── Wild encounters ───────────────────────────────────────────────────────

  private checkEncounter(): void {
    const tile = this.groundLayer.getTileAt(this.tileX, this.tileY);
    if (tile?.index !== TILE_TALLGRASS) return;
    const pool = this.currentZone.encounterPool;
    if (!pool.length || Math.random() > this.currentZone.encounterRate) return;

    const entry = pickByWeight(pool);
    const level = Phaser.Math.Between(entry.minLevel, entry.maxLevel);

    const initData: BattleInitData = {
      wildSpeciesId: entry.speciesId,
      wildLevel: level,
      zoneId: this.currentZone.id,
    };
    this.scene.pause("UIScene");
    this.scene.launch("BattleScene", initData);
    this.scene.pause();
  }

  // ── Zone transitions ──────────────────────────────────────────────────────

  private checkTransition(): void {
    const t = this.currentZone.transitions.find(
      tr => tr.tileX === this.tileX && tr.tileY === this.tileY,
    );
    if (t) this.transitionToZone(t.targetZoneId, t.spawnX, t.spawnY);
  }

  // ── Day/night ─────────────────────────────────────────────────────────────

  private updateDayNight(delta: number): void {
    this.clockAccMs += delta;
    if (this.clockAccMs >= MS_PER_GAME_MINUTE) {
      this.gameHour = (this.gameHour + this.clockAccMs / MS_PER_GAME_MINUTE / 60) % 24;
      this.clockAccMs = 0;
    }

    // Find surrounding keyframes
    let prev = OVERLAY[0];
    let next = OVERLAY[OVERLAY.length - 1];
    for (let i = 0; i < OVERLAY.length - 1; i++) {
      if (this.gameHour >= OVERLAY[i].hour && this.gameHour < OVERLAY[i + 1].hour) {
        prev = OVERLAY[i];
        next = OVERLAY[i + 1];
        break;
      }
    }

    const t = (this.gameHour - prev.hour) / (next.hour - prev.hour);
    const r = Math.round(Phaser.Math.Linear(prev.r, next.r, t));
    const g = Math.round(Phaser.Math.Linear(prev.g, next.g, t));
    const b = Math.round(Phaser.Math.Linear(prev.b, next.b, t));
    const alpha = Phaser.Math.Linear(prev.alpha, next.alpha, t);
    this.dayNightOverlay.setFillStyle(Phaser.Display.Color.GetColor(r, g, b), alpha);
  }

  // ── Animations ────────────────────────────────────────────────────────────

  private registerAnimations(): void {
    const dirs: Direction[] = ["down", "up", "left", "right"];
    for (const dir of dirs) {
      const b = ANIM_BASE[dir];
      if (!this.anims.exists(`walk-${dir}`)) {
        this.anims.create({
          key: `walk-${dir}`,
          frames: this.anims.generateFrameNumbers("player", { frames: [b, b + 1, b, b + 2] }),
          frameRate: 8,
          repeat: -1,
        });
      }
      if (!this.anims.exists(`idle-${dir}`)) {
        this.anims.create({
          key: `idle-${dir}`,
          frames: this.anims.generateFrameNumbers("player", { start: b, end: b }),
          frameRate: 1,
          repeat: 0,
        });
      }
    }
  }
}
