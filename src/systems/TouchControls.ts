import Phaser from "phaser";
import type { TouchState } from "@/systems/touchInput";
import { BASE_WIDTH, SAFE_INSET_X } from "@/config";

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
  private readonly menuButton: Phaser.GameObjects.Rectangle;
  private readonly labels: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene, state: TouchState) {
    const W = scene.scale.width;
    const H = scene.scale.height;
    const depth = 90; // below DialogueBox (100), above the world

    // On wide screens (phones) keep the controls clear of the camera cutout / rounded corners.
    const edge = W > BASE_WIDTH ? SAFE_INSET_X : 10;
    const btn = 28;
    const cx = edge + btn * 1.5 + 2; // d-pad center x (left button starts at the edge inset)
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

  setVisible(visible: boolean): void {
    for (const b of this.buttons) {
      b.setVisible(visible);
      if (visible) b.setInteractive({ useHandCursor: false }); else b.disableInteractive();
    }
    this.menuButton.setVisible(visible);
    if (visible) this.menuButton.setInteractive({ useHandCursor: false }); else this.menuButton.disableInteractive();
    this.actionButton.setVisible(visible);
    if (visible) this.actionButton.setInteractive({ useHandCursor: false }); else this.actionButton.disableInteractive();
    for (const l of this.labels) l.setVisible(visible);
  }
}
