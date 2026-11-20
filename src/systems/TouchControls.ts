import Phaser from "phaser";
import type { TouchState } from "@/systems/touchInput";
import { BASE_WIDTH, SAFE_INSET_X, LOGICAL_W, LOGICAL_H } from "@/config";

const PANEL_FILL   = 0x08081a;
const PANEL_ALPHA  = 0.55;
const STROKE_COLOR = 0x4488ff;
const LABEL_STYLE  = { fontSize: "13px", color: "#aaccff", fontFamily: "monospace", fontStyle: "bold" };

/**
 * On-screen d-pad + action button overlay, drawn fixed to the camera.
 * Writes into the shared TouchState (touchInput.ts) rather than calling
 * into WorldScene directly - WorldScene reads that state in its own
 * update() loop alongside the keyboard, exactly like an extra input
 * device. Keeps this module ignorant of world/battle game logic.
 */
export class TouchControls {
  private readonly buttons: Phaser.GameObjects.Rectangle[] = [];
  private readonly buttonDirs: (keyof Pick<TouchState, "up" | "down" | "left" | "right">)[] = [];
  private readonly scene: Phaser.Scene;
  private readonly state: TouchState;
  private visible = true;
  private readonly actionButton: Phaser.GameObjects.Arc;
  private readonly menuButton: Phaser.GameObjects.Rectangle;
  private readonly labels: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene, state: TouchState) {
    this.scene = scene;
    this.state = state;
    const W = LOGICAL_W;
    const H = LOGICAL_H;
    const depth = 90; // below DialogueBox (100), above the world

    // On wide screens (phones) keep the controls clear of the camera cutout / rounded corners.
    const edge = W > BASE_WIDTH ? SAFE_INSET_X : 10;
    const btn = 28;
    const cx = edge + btn * 1.5 + 2; // d-pad center x (left button starts at the edge inset)
    const cy = H - 12 - btn * 1.5 - 2; // d-pad center y (keeps the bottom button 12px above the screen edge)

    const dirSpecs: { dir: keyof Pick<TouchState, "up" | "down" | "left" | "right">; x: number; y: number; label: string }[] = [
      { dir: "up",    x: cx,          y: cy - btn - 2, label: "▲" },
      { dir: "down",  x: cx,          y: cy + btn + 2, label: "▼" },
      { dir: "left",  x: cx - btn - 2, y: cy,           label: "◀" },
      { dir: "right", x: cx + btn + 2, y: cy,           label: "▶" },
    ];

    for (const spec of dirSpecs) {
      const rect = scene.add.rectangle(spec.x, spec.y, btn, btn, PANEL_FILL, PANEL_ALPHA)
        .setStrokeStyle(2, STROKE_COLOR, 1)
        .setScrollFactor(0)
        .setDepth(depth);
      // Held directions are polled from the live pointers every frame (poll()), not tracked from
      // down/up events: a release that happens while the controls are hidden (battle or dialogue
      // starting under the thumb) never produced an "up", which left a direction stuck on.
      this.buttons.push(rect);
      this.buttonDirs.push(spec.dir);

      const label = scene.add.text(spec.x, spec.y, spec.label, LABEL_STYLE)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(depth);
      this.labels.push(label);
    }

    const ar = 28; // action button radius
    const ax = W - edge - ar;
    const ay = H - 10 - ar;
    this.actionButton = scene.add.circle(ax, ay, ar, PANEL_FILL, PANEL_ALPHA)
      .setStrokeStyle(2, STROKE_COLOR, 1)
      .setScrollFactor(0)
      .setDepth(depth)
      .setInteractive({ useHandCursor: false });
    this.actionButton.on("pointerdown", () => { state.actionPressed = true; });

    const actionLabel = scene.add.text(ax, ay, "A", LABEL_STYLE)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(depth);
    this.labels.push(actionLabel);

    // Menu button (top-right): opens the pause menu (equipment, pack).
    this.menuButton = scene.add.rectangle(W - edge - 22, 10 + 16, 44, 32, PANEL_FILL, PANEL_ALPHA)
      .setStrokeStyle(2, STROKE_COLOR, 1)
      .setScrollFactor(0)
      .setDepth(depth)
      .setInteractive({ useHandCursor: false });
    this.menuButton.on("pointerdown", () => { state.menuPressed = true; });
    this.labels.push(
      scene.add.text(W - edge - 22, 10 + 16, "MENU", { ...LABEL_STYLE, fontSize: "9px" })
        .setOrigin(0.5).setScrollFactor(0).setDepth(depth),
    );
  }

  /**
   * Call every frame: sets up/down/left/right from whichever pointers are currently down over a
   * d-pad button (stateless, so it cannot get stuck), and clears them while the controls are hidden.
   */
  poll(): void {
    const dirs = { up: false, down: false, left: false, right: false };
    if (this.visible) {
      const cam = this.scene.cameras.main;
      for (const p of this.scene.input.manager.pointers) {
        if (!p.isDown) continue;
        const pt = cam.getWorldPoint(p.x, p.y);
        this.buttons.forEach((b, i) => {
          const r = b.getBounds();
          if (pt.x >= r.x - 3 && pt.x <= r.right + 3 && pt.y >= r.y - 3 && pt.y <= r.bottom + 3) dirs[this.buttonDirs[i]] = true;
        });
      }
    }
    this.state.up = dirs.up; this.state.down = dirs.down; this.state.left = dirs.left; this.state.right = dirs.right;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    if (!visible) { this.state.up = this.state.down = this.state.left = this.state.right = false; }
    for (const b of this.buttons) b.setVisible(visible);
    this.menuButton.setVisible(visible);
    if (visible) this.menuButton.setInteractive({ useHandCursor: false }); else this.menuButton.disableInteractive();
    this.actionButton.setVisible(visible);
    if (visible) this.actionButton.setInteractive({ useHandCursor: false }); else this.actionButton.disableInteractive();
    for (const l of this.labels) l.setVisible(visible);
  }
}
