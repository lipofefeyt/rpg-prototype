import type { PixelCanvas } from "@/gfx/pixelDraw";
import { drawRatFront, drawRatBack } from "@/gfx/pixelart/rat";
import { drawDuckFront, drawDuckBack } from "@/gfx/pixelart/duck";
import { drawImpFront, drawImpBack } from "@/gfx/pixelart/imp";

/** Sprites are designed in a 64x64 space and rasterised at 1.5x: 96x96 pixels, shown at 96 logical px. */
export const PIXEL_ART_K = 1.5;
export const PIXEL_ART_SIZE = 64 * PIXEL_ART_K;

export type PixelDrawFn = (c: PixelCanvas) => void;

/**
 * Hand-composed battle art (src/gfx/pixelDraw.ts toolkit), keyed by species id. Species or views
 * missing here fall back to the older code-drawn sprites in creatureSprites.ts, so the roster
 * can be upgraded one creature at a time.
 */
export const PIXEL_ART: Record<number, { front?: PixelDrawFn; back?: PixelDrawFn }> = {
  19: { front: drawRatFront, back: drawRatBack }, // Giant Rat
  25: { front: drawImpFront, back: drawImpBack }, // Spark Imp
  54: { front: drawDuckFront, back: drawDuckBack }, // Marsh Duck
};
