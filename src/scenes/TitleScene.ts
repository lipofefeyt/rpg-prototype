import Phaser from "phaser";
import { drawPanel } from "@/gfx/panel";
import { BASE_WIDTH, GAME_HEIGHT, centerFixedLayout, attachFpsOverlay } from "@/config";
import { applySaveToRegistry, type SaveData } from "@/systems/saveLoad";

interface TitleOption {
  label: string;
  action: () => void;
}

const BTN_W = 176;
const BTN_H = 30;
const BTN_Y0 = 186; // top of the first button
const BTN_GAP = 40;

/**
 * Title / intro screen shown after loading: START on a fresh install, or CONTINUE + NEW GAME
 * when a save exists. Works with taps (buttons), arrows + Z/Enter/Space.
 */
export class TitleScene extends Phaser.Scene {
  private options: TitleOption[] = [];
  private selected = 0;
  private gfx!: Phaser.GameObjects.Graphics;
  private upKey!: Phaser.Input.Keyboard.Key;
  private downKey!: Phaser.Input.Keyboard.Key;
  private keys: Phaser.Input.Keyboard.Key[] = [];
  private canInput = false;
  private leaving = false;

  constructor() { super({ key: "TitleScene" }); }

  create() {
    this.selected = 0;
    this.canInput = false;
    this.leaving = false;
    centerFixedLayout(this);
    const W = BASE_WIDTH;
    const H = GAME_HEIGHT;
    const save = this.game.registry.get("pendingSave") as SaveData | undefined;

    // ── Background ───────────────────────────────────────────────────────────
    this.add.rectangle(-1000, -1000, W + 2000, H + 2000, 0x08091a).setOrigin(0);
    const stars = this.add.graphics();
    stars.fillStyle(0xffffff, 0.5);
    for (const [x, y] of [
      [28, 12], [95, 30], [185, 22], [280, 10], [375, 26], [455, 14],
      [14, 70], [72, 96], [160, 60], [330, 84], [420, 70], [468, 100],
      [40, 140], [450, 140], [22, 240], [472, 230], [58, 285], [422, 290],
    ]) stars.fillRect(x, y, 1, 1);
    const ground = this.add.graphics();
    ground.fillStyle(0x0f1238, 1);
    ground.fillRect(-1000, H - 30, W + 2000, 1030);

    // Drifting embers
    for (let i = 0; i < 14; i++) {
      const ember = this.add.rectangle(
        Phaser.Math.Between(20, W - 20), Phaser.Math.Between(H - 40, H - 10), 2, 2, 0xff8a30,
      ).setAlpha(0);
      this.tweens.add({
        targets: ember,
        y: ember.y - Phaser.Math.Between(90, 180),
        x: ember.x + Phaser.Math.Between(-24, 24),
        alpha: { from: 0.9, to: 0 },
        duration: Phaser.Math.Between(2200, 4200),
        delay: Phaser.Math.Between(0, 3000),
        repeat: -1,
      });
    }

    // ── Title ────────────────────────────────────────────────────────────────
    const title = this.add.text(W / 2, 78, "EMBERHOLD", {
      fontSize: "36px", color: "#ffcc66", fontFamily: "monospace", fontStyle: "bold",
      stroke: "#6a2a10", strokeThickness: 5,
    }).setOrigin(0.5);
    this.tweens.add({ targets: title, alpha: 0.82, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    this.add.text(W / 2, 118, "Tame monsters. Take up arms.", {
      fontSize: "10px", color: "#7f8fbf", fontFamily: "monospace",
    }).setOrigin(0.5);

    // ── Menu ─────────────────────────────────────────────────────────────────
    this.options = save
      ? [
          { label: "CONTINUE", action: () => this.go("WorldScene", save) },
          { label: "NEW GAME", action: () => this.go("StarterScene") },
        ]
      : [{ label: "START", action: () => this.go("StarterScene") }];

    this.gfx = this.add.graphics();
    this.options.forEach((opt, i) => {
      const x = (W - BTN_W) / 2;
      const y = BTN_Y0 + i * BTN_GAP;
      this.add.text(W / 2, y + BTN_H / 2, opt.label, {
        fontSize: "13px", color: "#e8f0ff", fontFamily: "monospace", fontStyle: "bold",
      }).setOrigin(0.5).setDepth(2);
      const zone = this.add.zone(x, y, BTN_W, BTN_H).setOrigin(0).setInteractive();
      zone.on("pointerdown", () => {
        if (!this.canInput || this.leaving) return;
        this.selected = i;
        this.redraw();
        opt.action();
      });
    });
    this.redraw();

    this.add.text(W / 2, H - 14, "Tap to choose   ·   ↑↓ and Z / Enter on keyboard", {
      fontSize: "8px", color: "#2e3858", fontFamily: "monospace",
    }).setOrigin(0.5);

    attachFpsOverlay(this);

    // ── Keyboard ─────────────────────────────────────────────────────────────
    const KC = Phaser.Input.Keyboard.KeyCodes;
    const kb = this.input.keyboard!;
    this.upKey = kb.addKey(KC.UP);
    this.downKey = kb.addKey(KC.DOWN);
    this.keys = [kb.addKey(KC.Z), kb.addKey(KC.ENTER), kb.addKey(KC.SPACE)];

    this.cameras.main.fadeIn(450, 0, 0, 0);
    this.time.delayedCall(500, () => { this.canInput = true; });
  }

  update() {
    if (!this.canInput || this.leaving) return;
    const JD = Phaser.Input.Keyboard.JustDown;
    const n = this.options.length;
    if (JD(this.upKey))   { this.selected = (this.selected + n - 1) % n; this.redraw(); }
    if (JD(this.downKey)) { this.selected = (this.selected + 1) % n; this.redraw(); }
    if (this.keys.some(k => JD(k))) this.options[this.selected].action();
  }

  private redraw(): void {
    const W = BASE_WIDTH;
    this.gfx.clear();
    this.options.forEach((_, i) => {
      const x = (W - BTN_W) / 2;
      const y = BTN_Y0 + i * BTN_GAP;
      const sel = i === this.selected;
      drawPanel(this.gfx, x, y, BTN_W, BTN_H, {
        cut: 3, fillAlpha: 0.97,
        fill: sel ? 0x1a3a7a : 0x0d1a3a, border: sel ? 0x5a98ff : 0x24389a,
      });
    });
  }

  private go(next: "WorldScene" | "StarterScene", save?: SaveData): void {
    if (this.leaving) return;
    this.leaving = true;
    if (save) {
      this.game.registry.set("resumeState", applySaveToRegistry(this.game, save));
    }
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start(next));
  }
}
