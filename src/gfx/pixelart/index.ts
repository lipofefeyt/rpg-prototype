import type { PixelCanvas } from "@/gfx/pixelDraw";
import { drawRatFront, drawRatBack } from "@/gfx/pixelart/rat";
import { drawDuckFront, drawDuckBack } from "@/gfx/pixelart/duck";
import { drawImpFront, drawImpBack } from "@/gfx/pixelart/imp";
import { drawCrowFront, drawCrowBack, drawHawkFront, drawHawkBack } from "@/gfx/pixelart/crow";
import { drawBriarFront, drawBriarBack } from "@/gfx/pixelart/hedge";
import { drawWardenFront, drawBriarqueenFront, drawGrukkFront } from "@/gfx/pixelart/bosses";
import { drawBatFront, drawBatBack } from "@/gfx/pixelart/bat";
import { drawHedgeFront, drawHedgeBack } from "@/gfx/pixelart/hedge";
import { drawGolemFront, drawGolemBack } from "@/gfx/pixelart/golem";
import { drawWraithFront, drawWraithBack } from "@/gfx/pixelart/wraith";
import { drawPikeFront, drawPikeBack } from "@/gfx/pixelart/pike";
import { drawWolfFront, drawWolfBack } from "@/gfx/pixelart/wolf";
import { drawBoarFront, drawBoarBack } from "@/gfx/pixelart/boar";
import { drawKnightFront, drawKnightBack, drawMageFront, drawMageBack, drawRangerFront, drawRangerBack } from "@/gfx/pixelart/heroes";

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
  1: { front: drawRangerFront, back: drawRangerBack }, // Ranger
  4: { front: drawMageFront, back: drawMageBack }, // Mage
  7: { front: drawKnightFront, back: drawKnightBack }, // Knight
  16: { front: drawCrowFront, back: drawCrowBack }, // Carrion Crow
  41: { front: drawBatFront, back: drawBatBack }, // Cave Bat
  63: { front: drawHedgeFront, back: drawHedgeBack }, // Hedge Sprite
  74: { front: drawGolemFront, back: drawGolemBack }, // Stone Golem
  92: { front: drawWraithFront, back: drawWraithBack }, // Wraith
  129: { front: drawPikeFront, back: drawPikeBack }, // River Pike
  210: { front: drawWolfFront, back: drawWolfBack }, // Dire Wolf
  212: { front: drawBoarFront, back: drawBoarBack }, // Tusked Boar
  200: { front: drawWardenFront, back: drawWardenFront }, // boss: Cavern Warden
  201: { front: drawBriarqueenFront, back: drawBriarqueenFront }, // boss: Briarqueen
  202: { front: drawGrukkFront, back: drawGrukkFront }, // boss: Warlord Grukk
  211: { front: drawBriarFront, back: drawBriarBack }, // Briar Sprite (thorny Hedge Sprite)
  213: { front: drawHawkFront, back: drawHawkBack }, // Dust Hawk (tan Carrion Crow)
  19: { front: drawRatFront, back: drawRatBack }, // Giant Rat
  25: { front: drawImpFront, back: drawImpBack }, // Spark Imp
  54: { front: drawDuckFront, back: drawDuckBack }, // Marsh Duck
};
