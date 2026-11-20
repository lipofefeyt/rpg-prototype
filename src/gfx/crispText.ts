import Phaser from "phaser";
import { SCREEN_K } from "@/config";

/** Bundled pixel font (imported in main.ts); monospace stays as the fallback for glyphs it lacks (arrows, etc). */
export const UI_FONT = '"DotGothic16", monospace';

/**
 * DotGothic16 is drawn on a 16-pixel em. It only looks right when every font pixel covers a
 * whole number of device pixels, so sizes are snapped to 16 * n / SCREEN_K logical px
 * (K = 3: 10.67, 16, 21.33, ...); anything else gets uneven pixel columns. (Pixelify Sans was
 * tried first but its f and Z read as A and 2 at small sizes.) The 1.12 bias rounds borderline
 * sizes up so 12-13px text does not shrink.
 */
const FONT_GRID = 16;
function snapFontSize(size: string | number | undefined): string | number | undefined {
  const px = typeof size === "number" ? size : parseFloat(size ?? "");
  if (!Number.isFinite(px)) return size;
  const n = Math.max(2, Math.round(((px * SCREEN_K) / FONT_GRID) * 1.12));
  return `${(FONT_GRID * n) / SCREEN_K}px`;
}

/**
 * Makes every `scene.add.text(...)` rasterise at SCREEN_K x resolution unless a style says
 * otherwise, and maps the generic `monospace` family to the bundled pixel font (UI_FONT). With the cameras zoomed by SCREEN_K this puts one text texel on one device pixel,
 * so text is sharp instead of an upscaled low-res canvas. Call once before the game is created.
 */
export function installCrispText(): void {
  const proto = Phaser.GameObjects.GameObjectFactory.prototype as unknown as {
    text: (x: number, y: number, text: string | string[], style?: Phaser.Types.GameObjects.Text.TextStyle) => Phaser.GameObjects.Text;
  };
  const original = proto.text;
  proto.text = function (this: unknown, x, y, text, style) {
    const fam = style?.fontFamily;
    const useUiFont = !fam || fam === "monospace";
    const fontFamily = useUiFont ? UI_FONT : fam;
    const fontSize = useUiFont ? snapFontSize(style?.fontSize) : style?.fontSize;
    // DotGothic16 has no bold face and the browser's faked bold smears the pixel grid, so drop it.
    const fontStyle = useUiFont && style?.fontStyle?.includes("bold") ? style.fontStyle.replace("bold", "").trim() : style?.fontStyle;
    return original.call(this, x, y, text, {
      resolution: SCREEN_K, ...style, fontFamily,
      ...(fontSize !== undefined ? { fontSize } : {}),
      ...(fontStyle !== undefined ? { fontStyle } : {}),
    });
  };
}
