import Phaser from "phaser";
import type { TouchState } from "@/systems/touchInput";

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
  private readonly actionButton: Phaser.GameObjects.Arc;
  private readonly labels: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene, state: TouchState) {
    const W = scene.scale.width;
    const H = scene.scale.height;
    const depth = 90; // below DialogueBox (100), above the world

    const btn = 22;
    const cx = 10 + btn + 2; // d-pad center x
    const cy = H - 10 - btn - 2; // d-pad center y

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
        .setDepth(depth)
        .setInteractive({ useHandCursor: false });
      rect.on("pointerdown", () => { state[spec.dir] = true; });
      rect.on("pointerup",   () => { state[spec.dir] = false; });
      rect.on("pointerout",  () => { state[spec.dir] = false; });
      this.buttons.push(rect);

      const label = scene.add.text(spec.x, spec.y, spec.label, LABEL_STYLE)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(depth);
      this.labels.push(label);
    }

    const ax = W - 10 - 24;
    const ay = H - 10 - 24;
    this.actionButton = scene.add.circle(ax, ay, 24, PANEL_FILL, PANEL_ALPHA)
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
  }

  setVisible(visible: boolean): void {
    for (const b of this.buttons) {
      b.setVisible(visible);
      if (visible) b.setInteractive({ useHandCursor: false }); else b.disableInteractive();
    }
    this.actionButton.setVisible(visible);
    if (visible) this.actionButton.setInteractive({ useHandCursor: false }); else this.actionButton.disableInteractive();
    for (const l of this.labels) l.setVisible(visible);
  }
}
