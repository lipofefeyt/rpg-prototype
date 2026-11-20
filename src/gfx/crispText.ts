import Phaser from "phaser";
import { SCREEN_K } from "@/config";

/**
 * Makes every `scene.add.text(...)` rasterise at SCREEN_K x resolution unless a style says
 * otherwise. With the cameras zoomed by SCREEN_K this puts one text texel on one device pixel,
 * so text is sharp instead of an upscaled low-res canvas. Call once before the game is created.
 */
export function installCrispText(): void {
  const proto = Phaser.GameObjects.GameObjectFactory.prototype as unknown as {
    text: (x: number, y: number, text: string | string[], style?: Phaser.Types.GameObjects.Text.TextStyle) => Phaser.GameObjects.Text;
  };
  const original = proto.text;
  proto.text = function (this: unknown, x, y, text, style) {
    return original.call(this, x, y, text, { resolution: SCREEN_K, ...style });
  };
}
