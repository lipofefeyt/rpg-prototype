import Phaser from "phaser";
import { HERO_DRAWERS } from "@/gfx/heroSprites";
import { drawWardenFront } from "@/gfx/bossSprites";
import { drawSparkImpFront, drawSparkImpBack } from "@/gfx/sparkImp";
import {
  drawDuckFront, drawDuckBack, drawGolemFront, drawGolemBack, drawPikeFront, drawPikeBack,
  drawBatFront, drawBatBack, drawHedgeFront, drawHedgeBack, HEDGE_PAL, BRIAR_PAL,
} from "@/gfx/redrawnSprites";
import {
  recolor, drawWolfFront, drawWolfBack, drawBoarFront, drawBoarBack, drawBriarqueenFront, drawGrukkFront,
} from "@/gfx/zoneSprites";

/**
 * Original battle-creature sprites (front + back, 64x64 each) for all 12 species,
 * generated procedurally via Phaser Graphics the same way BootScene.ts already builds
 * the tileset/player/NPC art - no external image files, no IP exposure. Called once from
 * BootScene.create() before PreloadScene starts.
 */

type DrawFn = (g: Phaser.GameObjects.Graphics) => void;

export function genCreatureSprites(scene: Phaser.Scene): void {
  for (const [idStr, { front, back }] of Object.entries(CREATURE_DRAWERS)) {
    const id = Number(idStr);
    genTexture(scene, `creature-front-${id}`, front);
    genTexture(scene, `creature-back-${id}`, back);
  }
}

function genTexture(scene: Phaser.Scene, key: string, drawFn: DrawFn): void {
  const g = scene.add.graphics();
  drawFn(g);
  g.generateTexture(key, 64, 64);
  g.destroy();
}

function drawFlitterwingFront(g: Phaser.GameObjects.Graphics): void {
  const R = (c: number, x: number, y: number, w: number, h: number) => { g.fillStyle(c); g.fillRect(x, y, w, h); };
  const BODY = 0xc8a068;
  const BELLY = 0xf0e0b8;
  const WING = 0x9a7840;
  const BEAK = 0xe0902a;
  const EYE = 0x1a1a1a;
  const TAIL = 0x9a7840;

  R(BODY, 27, 21, 10, 1);
  R(BODY, 25, 22, 14, 1);
  R(BODY, 24, 23, 16, 1);
  R(BODY, 23, 24, 18, 1);
  R(BODY, 22, 25, 20, 1);
  R(BODY, 21, 26, 22, 2);
  R(BODY, 20, 28, 24, 3);
  R(BODY, 19, 31, 26, 7);
  R(BODY, 20, 38, 24, 3);
  R(BODY, 21, 41, 22, 2);
  R(BODY, 22, 43, 20, 1);
  R(BODY, 23, 44, 18, 1);
  R(BODY, 24, 45, 16, 1);
  R(BODY, 25, 46, 14, 1);
  R(BODY, 27, 47, 10, 1);
  R(BELLY, 29, 29, 6, 1);
  R(BELLY, 28, 30, 8, 1);
  R(BELLY, 27, 31, 10, 1);
  R(BELLY, 26, 32, 12, 2);
  R(BELLY, 25, 34, 14, 7);
  R(BELLY, 26, 41, 12, 2);
  R(BELLY, 27, 43, 10, 1);
  R(BELLY, 28, 44, 8, 1);
  R(BELLY, 29, 45, 6, 1);
  R(BODY, 28, 13, 8, 1);
  R(BODY, 26, 14, 12, 1);
  R(BODY, 25, 15, 14, 1);
  R(BODY, 24, 16, 16, 2);
  R(BODY, 23, 18, 18, 5);
  R(BODY, 24, 23, 16, 2);
  R(BODY, 25, 25, 14, 1);
  R(BODY, 26, 26, 12, 1);
  R(BODY, 28, 27, 8, 1);
  R(BEAK, 29, 18, 6, 4);
  R(EYE, 27, 15, 3, 3);
  R(EYE, 35, 15, 3, 3);
  R(WING, 13, 21, 6, 1);
  R(WING, 11, 22, 10, 1);
  R(WING, 10, 23, 12, 2);
  R(WING, 9, 25, 14, 2);
  R(WING, 8, 27, 16, 3);
  R(WING, 7, 30, 18, 9);
  R(WING, 8, 39, 16, 3);
  R(WING, 9, 42, 14, 2);
  R(WING, 10, 44, 12, 2);
  R(WING, 11, 46, 10, 1);
  R(WING, 13, 47, 6, 1);
  R(WING, 45, 21, 6, 1);
  R(WING, 43, 22, 10, 1);
  R(WING, 42, 23, 12, 2);
  R(WING, 41, 25, 14, 2);
  R(WING, 40, 27, 16, 3);
  R(WING, 39, 30, 18, 9);
  R(WING, 40, 39, 16, 3);
  R(WING, 41, 42, 14, 2);
  R(WING, 42, 44, 12, 2);
  R(WING, 43, 46, 10, 1);
  R(WING, 45, 47, 6, 1);
  R(TAIL, 28, 46, 8, 10);
}

function drawFlitterwingBack(g: Phaser.GameObjects.Graphics): void {
  const R = (c: number, x: number, y: number, w: number, h: number) => { g.fillStyle(c); g.fillRect(x, y, w, h); };
  const BODY = 0xc8a068;
  const WING = 0x9a7840;
  const WINGD = 0x7a5c2e;
  const TAIL = 0x9a7840;
  const HEAD = 0xc8a068;

  R(BODY, 27, 21, 10, 1);
  R(BODY, 25, 22, 14, 1);
  R(BODY, 24, 23, 16, 1);
  R(BODY, 23, 24, 18, 1);
  R(BODY, 22, 25, 20, 1);
  R(BODY, 21, 26, 22, 2);
  R(BODY, 20, 28, 24, 3);
  R(BODY, 19, 31, 26, 7);
  R(BODY, 20, 38, 24, 3);
  R(BODY, 21, 41, 22, 2);
  R(BODY, 22, 43, 20, 1);
  R(BODY, 23, 44, 18, 1);
  R(BODY, 24, 45, 16, 1);
  R(BODY, 25, 46, 14, 1);
  R(BODY, 27, 47, 10, 1);
  R(HEAD, 28, 13, 8, 1);
  R(HEAD, 26, 14, 12, 1);
  R(HEAD, 25, 15, 14, 1);
  R(HEAD, 24, 16, 16, 2);
  R(HEAD, 23, 18, 18, 5);
  R(HEAD, 24, 23, 16, 2);
  R(HEAD, 25, 25, 14, 1);
  R(HEAD, 26, 26, 12, 1);
  R(HEAD, 28, 27, 8, 1);
  R(WING, 18, 17, 4, 1);
  R(WING, 17, 18, 6, 1);
  R(WING, 16, 19, 8, 1);
  R(WING, 15, 20, 10, 3);
  R(WING, 14, 23, 12, 4);
  R(WING, 13, 27, 14, 11);
  R(WING, 14, 38, 12, 4);
  R(WING, 15, 42, 10, 3);
  R(WING, 16, 45, 8, 1);
  R(WING, 17, 46, 6, 1);
  R(WING, 18, 47, 4, 1);
  R(WING, 42, 17, 4, 1);
  R(WING, 41, 18, 6, 1);
  R(WING, 40, 19, 8, 1);
  R(WING, 39, 20, 10, 3);
  R(WING, 38, 23, 12, 4);
  R(WING, 37, 27, 14, 11);
  R(WING, 38, 38, 12, 4);
  R(WING, 39, 42, 10, 3);
  R(WING, 40, 45, 8, 1);
  R(WING, 41, 46, 6, 1);
  R(WING, 42, 47, 4, 1);
  R(WINGD, 18, 27, 4, 2);
  R(WINGD, 17, 29, 6, 3);
  R(WINGD, 16, 32, 8, 9);
  R(WINGD, 17, 41, 6, 3);
  R(WINGD, 18, 44, 4, 2);
  R(WINGD, 42, 27, 4, 2);
  R(WINGD, 41, 29, 6, 3);
  R(WINGD, 40, 32, 8, 9);
  R(WINGD, 41, 41, 6, 3);
  R(WINGD, 42, 44, 4, 2);
  R(TAIL, 26, 46, 12, 12);
}

function drawNibbleratFront(g: Phaser.GameObjects.Graphics): void {
  const R = (c: number, x: number, y: number, w: number, h: number) => { g.fillStyle(c); g.fillRect(x, y, w, h); };
  const BODY = 0x9a8a78;
  const BELLY = 0xe0d0b8;
  const EAR = 0x7a6858;
  const EYE = 0x1a1a1a;
  const TOOTH = 0xffffff;
  const TAIL = 0x7a6858;
  const WHISK = 0x3a3028;

  R(BODY, 26, 26, 12, 1);
  R(BODY, 24, 27, 16, 1);
  R(BODY, 22, 28, 20, 1);
  R(BODY, 21, 29, 22, 1);
  R(BODY, 20, 30, 24, 1);
  R(BODY, 19, 31, 26, 2);
  R(BODY, 18, 33, 28, 2);
  R(BODY, 17, 35, 30, 7);
  R(BODY, 18, 42, 28, 2);
  R(BODY, 19, 44, 26, 2);
  R(BODY, 20, 46, 24, 1);
  R(BODY, 21, 47, 22, 1);
  R(BODY, 22, 48, 20, 1);
  R(BODY, 24, 49, 16, 1);
  R(BODY, 26, 50, 12, 1);
  R(BELLY, 28, 34, 8, 1);
  R(BELLY, 27, 35, 10, 1);
  R(BELLY, 26, 36, 12, 1);
  R(BELLY, 25, 37, 14, 2);
  R(BELLY, 24, 39, 16, 5);
  R(BELLY, 25, 44, 14, 2);
  R(BELLY, 26, 46, 12, 1);
  R(BELLY, 27, 47, 10, 1);
  R(BELLY, 28, 48, 8, 1);
  R(BODY, 27, 15, 10, 1);
  R(BODY, 25, 16, 14, 1);
  R(BODY, 24, 17, 16, 1);
  R(BODY, 23, 18, 18, 1);
  R(BODY, 22, 19, 20, 3);
  R(BODY, 21, 22, 22, 5);
  R(BODY, 22, 27, 20, 3);
  R(BODY, 23, 30, 18, 1);
  R(BODY, 24, 31, 16, 1);
  R(BODY, 25, 32, 14, 1);
  R(BODY, 27, 33, 10, 1);
  R(EAR, 20, 10, 6, 1);
  R(EAR, 19, 11, 8, 2);
  R(EAR, 18, 13, 10, 5);
  R(EAR, 19, 18, 8, 2);
  R(EAR, 20, 20, 6, 1);
  R(EAR, 38, 10, 6, 1);
  R(EAR, 37, 11, 8, 2);
  R(EAR, 36, 13, 10, 5);
  R(EAR, 37, 18, 8, 2);
  R(EAR, 38, 20, 6, 1);
  R(EYE, 26, 22, 3, 3);
  R(EYE, 35, 22, 3, 3);
  R(TOOTH, 30, 29, 2, 3);
  R(TOOTH, 33, 29, 2, 3);
  R(WHISK, 16, 24, 8, 1);
  R(WHISK, 40, 24, 8, 1);
  R(TAIL, 44, 44, 14, 2);
}

function drawNibbleratBack(g: Phaser.GameObjects.Graphics): void {
  const R = (c: number, x: number, y: number, w: number, h: number) => { g.fillStyle(c); g.fillRect(x, y, w, h); };
  const BODY = 0x9a8a78;
  const EAR = 0x7a6858;
  const STRIPE = 0x7a6858;
  const TAIL = 0x7a6858;

  R(BODY, 26, 26, 12, 1);
  R(BODY, 24, 27, 16, 1);
  R(BODY, 22, 28, 20, 1);
  R(BODY, 21, 29, 22, 1);
  R(BODY, 20, 30, 24, 1);
  R(BODY, 19, 31, 26, 2);
  R(BODY, 18, 33, 28, 2);
  R(BODY, 17, 35, 30, 7);
  R(BODY, 18, 42, 28, 2);
  R(BODY, 19, 44, 26, 2);
  R(BODY, 20, 46, 24, 1);
  R(BODY, 21, 47, 22, 1);
  R(BODY, 22, 48, 20, 1);
  R(BODY, 24, 49, 16, 1);
  R(BODY, 26, 50, 12, 1);
  R(BODY, 27, 15, 10, 1);
  R(BODY, 25, 16, 14, 1);
  R(BODY, 24, 17, 16, 1);
  R(BODY, 23, 18, 18, 1);
  R(BODY, 22, 19, 20, 3);
  R(BODY, 21, 22, 22, 5);
  R(BODY, 22, 27, 20, 3);
  R(BODY, 23, 30, 18, 1);
  R(BODY, 24, 31, 16, 1);
  R(BODY, 25, 32, 14, 1);
  R(BODY, 27, 33, 10, 1);
  R(EAR, 20, 10, 6, 1);
  R(EAR, 19, 11, 8, 2);
  R(EAR, 18, 13, 10, 5);
  R(EAR, 19, 18, 8, 2);
  R(EAR, 20, 20, 6, 1);
  R(EAR, 38, 10, 6, 1);
  R(EAR, 37, 11, 8, 2);
  R(EAR, 36, 13, 10, 5);
  R(EAR, 37, 18, 8, 2);
  R(EAR, 38, 20, 6, 1);
  R(STRIPE, 31, 20, 2, 28);
  R(TAIL, 44, 42, 16, 2);
  R(TAIL, 56, 32, 2, 12);
}

function drawGloomistFront(g: Phaser.GameObjects.Graphics): void {
  const R = (c: number, x: number, y: number, w: number, h: number) => { g.fillStyle(c); g.fillRect(x, y, w, h); };
  const BODY = 0x7a5a9a;
  const BODYD = 0x5a3e78;
  const WISP = 0x5a3e78;
  const EYE = 0xf0f0f0;
  const MOUTH = 0x2a1a3a;

  R(BODY, 26, 17, 12, 1);
  R(BODY, 24, 18, 16, 1);
  R(BODY, 22, 19, 20, 1);
  R(BODY, 21, 20, 22, 1);
  R(BODY, 20, 21, 24, 1);
  R(BODY, 19, 22, 26, 1);
  R(BODY, 18, 23, 28, 1);
  R(BODY, 17, 24, 30, 2);
  R(BODY, 16, 26, 32, 3);
  R(BODY, 15, 29, 34, 7);
  R(BODY, 16, 36, 32, 3);
  R(BODY, 17, 39, 30, 2);
  R(BODY, 18, 41, 28, 1);
  R(BODY, 19, 42, 26, 1);
  R(BODY, 20, 43, 24, 1);
  R(BODY, 21, 44, 22, 1);
  R(BODY, 22, 45, 20, 1);
  R(BODY, 24, 46, 16, 1);
  R(BODY, 26, 47, 12, 1);
  R(BODYD, 15, 36, 34, 3);
  R(BODYD, 16, 39, 32, 2);
  R(BODYD, 17, 41, 30, 1);
  R(BODYD, 18, 42, 28, 1);
  R(BODYD, 20, 43, 24, 1);
  R(BODYD, 22, 44, 20, 1);
  R(BODYD, 25, 45, 14, 1);
  R(WISP, 16, 40, 5, 8);
  R(WISP, 22, 40, 5, 12);
  R(WISP, 28, 40, 5, 8);
  R(WISP, 34, 40, 5, 12);
  R(WISP, 40, 40, 5, 8);
  R(WISP, 46, 40, 5, 12);
  R(EYE, 22, 24, 4, 1);
  R(EYE, 21, 25, 6, 1);
  R(EYE, 20, 26, 8, 5);
  R(EYE, 21, 31, 6, 1);
  R(EYE, 22, 32, 4, 1);
  R(EYE, 38, 24, 4, 1);
  R(EYE, 37, 25, 6, 1);
  R(EYE, 36, 26, 8, 5);
  R(EYE, 37, 31, 6, 1);
  R(EYE, 38, 32, 4, 1);
  R(MOUTH, 27, 35, 10, 1);
  R(MOUTH, 26, 36, 12, 1);
  R(MOUTH, 25, 37, 14, 3);
  R(MOUTH, 26, 40, 12, 1);
  R(MOUTH, 27, 41, 10, 1);
}

function drawGloomistBack(g: Phaser.GameObjects.Graphics): void {
  const R = (c: number, x: number, y: number, w: number, h: number) => { g.fillStyle(c); g.fillRect(x, y, w, h); };
  const BODY = 0x7a5a9a;
  const BODYD = 0x5a3e78;
  const WISP = 0x5a3e78;
  const SWIRL = 0x9478b8;

  R(BODY, 26, 17, 12, 1);
  R(BODY, 24, 18, 16, 1);
  R(BODY, 22, 19, 20, 1);
  R(BODY, 21, 20, 22, 1);
  R(BODY, 20, 21, 24, 1);
  R(BODY, 19, 22, 26, 1);
  R(BODY, 18, 23, 28, 1);
  R(BODY, 17, 24, 30, 2);
  R(BODY, 16, 26, 32, 3);
  R(BODY, 15, 29, 34, 7);
  R(BODY, 16, 36, 32, 3);
  R(BODY, 17, 39, 30, 2);
  R(BODY, 18, 41, 28, 1);
  R(BODY, 19, 42, 26, 1);
  R(BODY, 20, 43, 24, 1);
  R(BODY, 21, 44, 22, 1);
  R(BODY, 22, 45, 20, 1);
  R(BODY, 24, 46, 16, 1);
  R(BODY, 26, 47, 12, 1);
  R(BODYD, 15, 36, 34, 3);
  R(BODYD, 16, 39, 32, 2);
  R(BODYD, 17, 41, 30, 1);
  R(BODYD, 18, 42, 28, 1);
  R(BODYD, 20, 43, 24, 1);
  R(BODYD, 22, 44, 20, 1);
  R(BODYD, 25, 45, 14, 1);
  R(WISP, 16, 40, 5, 8);
  R(WISP, 22, 40, 5, 12);
  R(WISP, 28, 40, 5, 8);
  R(WISP, 34, 40, 5, 12);
  R(WISP, 40, 40, 5, 8);
  R(WISP, 46, 40, 5, 12);
  R(SWIRL, 28, 21, 8, 1);
  R(SWIRL, 27, 22, 10, 1);
  R(SWIRL, 26, 23, 12, 1);
  R(SWIRL, 25, 24, 14, 2);
  R(SWIRL, 24, 26, 16, 5);
  R(SWIRL, 25, 31, 14, 2);
  R(SWIRL, 26, 33, 12, 1);
  R(SWIRL, 27, 34, 10, 1);
  R(SWIRL, 28, 35, 8, 1);
  R(BODY, 29, 24, 6, 1);
  R(BODY, 28, 25, 8, 1);
  R(BODY, 27, 26, 10, 5);
  R(BODY, 28, 31, 8, 1);
  R(BODY, 29, 32, 6, 1);
}

// ── Registry ──
export const CREATURE_DRAWERS: Record<number, { front: DrawFn; back: DrawFn }> = {
...HERO_DRAWERS,
200: { front: drawWardenFront, back: drawWardenFront }, // boss: Cavern Warden (never in a party, so no distinct back view)
201: { front: drawBriarqueenFront, back: drawBriarqueenFront }, // boss
202: { front: drawGrukkFront, back: drawGrukkFront },           // boss
210: { front: drawWolfFront, back: drawWolfBack },
211: { front: drawHedgeFront(BRIAR_PAL), back: drawHedgeBack(BRIAR_PAL) },  // Briar Sprite: thornier, darker Hedge Sprite
212: { front: drawBoarFront, back: drawBoarBack },
213: { front: recolor(drawFlitterwingFront, 0.09, 0.9), back: recolor(drawFlitterwingBack, 0.09, 0.9) }, // Dust Hawk: tan Carrion Crow
16: { front: drawFlitterwingFront, back: drawFlitterwingBack },
19: { front: drawNibbleratFront, back: drawNibbleratBack },
25: { front: drawSparkImpFront, back: drawSparkImpBack },
41: { front: drawBatFront, back: drawBatBack },
54: { front: drawDuckFront, back: drawDuckBack },
63: { front: drawHedgeFront(HEDGE_PAL), back: drawHedgeBack(HEDGE_PAL) },
74: { front: drawGolemFront, back: drawGolemBack },
92: { front: drawGloomistFront, back: drawGloomistBack },
129: { front: drawPikeFront, back: drawPikeBack },
};
