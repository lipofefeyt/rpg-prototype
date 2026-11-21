import Phaser from "phaser";
import { applyScreenScale, LOGICAL_W, LOGICAL_H, SPRITE_SCALE } from "@/config";

/** Species shown in the gallery, in roster order (heroes, monsters, variants, bosses). */
const IDS = [1, 4, 7, 16, 19, 25, 41, 54, 63, 74, 92, 129, 200, 201, 202, 210, 211, 212, 213];
const COLS = 7;

/**
 * Art review screen, only reachable in builds made with VITE_ART_GALLERY=1: every battle sprite
 * on a grid, front views first; tap anywhere to flip between front and back views.
 */
export class GalleryScene extends Phaser.Scene {
  private view: "front" | "back" = "front";
  private items: Phaser.GameObjects.GameObject[] = [];

  constructor() { super({ key: "GalleryScene" }); }

  create() {
    applyScreenScale(this);
    this.view = "front";
    this.draw();
    this.input.on("pointerdown", () => { this.view = this.view === "front" ? "back" : "front"; this.draw(); });
  }

  private draw(): void {
    for (const o of this.items) o.destroy();
    this.items = [];
    const W = LOGICAL_W, H = LOGICAL_H;
    this.items.push(this.add.rectangle(0, 0, W, H, 0x6fb0dc).setOrigin(0));
    this.items.push(this.add.rectangle(0, H * 0.55, W, H * 0.45, 0x5a8c3a).setOrigin(0));
    const cw = W / COLS, rows = Math.ceil(IDS.length / COLS), ch = H / rows;
    IDS.forEach((id, i) => {
      const cx = (i % COLS) * cw + cw / 2, cy = Math.floor(i / COLS) * ch + ch - 18;
      const key = `creature-${this.view}-${id}`;
      if (this.textures.exists(key)) this.items.push(this.add.image(cx, cy, key).setOrigin(0.5, 1).setScale(SPRITE_SCALE * 0.9));
      this.items.push(this.add.text(cx, cy + 3, `${id}`, { fontSize: "10px", color: "#ffffff", fontFamily: "monospace", backgroundColor: "#00000088" }).setOrigin(0.5, 0));
    });
    this.items.push(this.add.text(6, 4, `${this.view.toUpperCase()} - tap to flip`, { fontSize: "11px", color: "#ffffff", fontFamily: "monospace", backgroundColor: "#000000aa" }));
  }
}
