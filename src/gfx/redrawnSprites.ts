import Phaser from "phaser";

/**
 * Original replacements for legacy sprites that were too close to existing designs:
 * Marsh Duck (mallard), Stone Golem (stacked cairn), River Pike (side-on fish), Cave Bat
 * (furred bat with finger-boned wings), Hedge Sprite / Briar Sprite (leafy bush spirit).
 * All 64x64, front + back, drawn with Phaser Graphics rects.
 */

type G = Phaser.GameObjects.Graphics;
type Rect = (c: number, x: number, y: number, w: number, h: number) => void;

const rects = (g: G): Rect => (c, x, y, w, h) => { g.fillStyle(c); g.fillRect(x, y, w, h); };
/** Same rect function reflected across the vertical centre line (x -> 64 - x - w). */
const mirrored = (R: Rect): Rect => (c, x, y, w, h) => R(c, 64 - x - w, y, w, h);
/** Draws a 1-px-thick (or [t]) line with rects. */
function line(R: Rect, c: number, x0: number, y0: number, x1: number, y1: number, t = 1): void {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) R(c, Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), t, t);
}

// ── Marsh Duck: a mallard ───────────────────────────────────────────────────

const D_HEAD = 0x2f7f4a, D_HEAD_L = 0x4aa064, D_BILL = 0xf2a93a, D_BILL_D = 0xc9822a, D_COLLAR = 0xf4f4f0;
const D_BREAST = 0x8c5a3c, D_BREAST_D = 0x6e4430, D_BODY = 0xb4b4ba, D_BODY_D = 0x86868e, D_WING = 0x93939c;
const D_SPEC = 0x3a5fb0, D_FEET = 0xf08a2a, D_TAIL = 0x2a2a3a, D_EYE = 0x1a1a1a, D_OUT = 0x2a2634;

export function drawDuckFront(g: G): void {
  const R = rects(g); const C = (c: number, y: number, w: number, h: number) => R(c, 32 - w / 2, y, w, h);
  C(D_OUT, 59, 30, 2);
  // webbed feet
  R(D_FEET, 19, 54, 11, 3); R(D_FEET, 34, 54, 11, 3);
  R(D_FEET, 17, 56, 5, 2); R(D_FEET, 22, 57, 5, 2); R(D_FEET, 28, 56, 3, 2);
  R(D_FEET, 33, 56, 3, 2); R(D_FEET, 37, 57, 5, 2); R(D_FEET, 42, 56, 5, 2);
  // body: chestnut breast over a grey belly
  C(D_BODY_D, 38, 36, 16); C(D_BODY, 38, 32, 14); C(D_BODY_D, 49, 30, 5);
  C(D_BREAST_D, 28, 26, 13); C(D_BREAST, 28, 22, 11); C(D_BREAST_D, 36, 18, 3);
  // folded wings with the blue speculum
  R(D_WING, 11, 31, 9, 19); R(D_BODY_D, 12, 44, 7, 6); R(D_SPEC, 13, 40, 5, 4);
  R(D_WING, 44, 31, 9, 19); R(D_BODY_D, 45, 44, 7, 6); R(D_SPEC, 46, 40, 5, 4);
  // white collar, neck, head
  C(D_COLLAR, 25, 18, 4);
  C(D_HEAD, 14, 14, 11); C(D_HEAD, 6, 20, 12); C(D_HEAD, 7, 22, 12); C(D_HEAD_L, 8, 8, 3);
  // eyes + broad flat bill
  R(0xffffff, 24, 12, 5, 5); R(D_EYE, 26, 13, 3, 3);
  R(0xffffff, 35, 12, 5, 5); R(D_EYE, 36, 13, 3, 3);
  C(D_BILL, 19, 20, 6); C(D_BILL_D, 24, 20, 2); R(D_BILL_D, 28, 20, 2, 1); R(D_BILL_D, 34, 20, 2, 1);
}

export function drawDuckBack(g: G): void {
  const R = rects(g); const C = (c: number, y: number, w: number, h: number) => R(c, 32 - w / 2, y, w, h);
  C(D_OUT, 60, 30, 2);
  R(D_FEET, 19, 56, 11, 3); R(D_FEET, 34, 56, 11, 3);
  // rounded body: brown mantle down the middle, grey flanks
  C(D_BODY_D, 29, 30, 4); C(D_BODY_D, 32, 38, 18); C(D_BODY_D, 49, 34, 5); C(D_BODY_D, 53, 26, 2);
  C(D_BODY, 33, 34, 15);
  C(D_BREAST_D, 31, 14, 20); C(D_BREAST, 33, 10, 15);
  // folded wings with a blue speculum low on each side
  R(D_WING, 17, 34, 8, 16); R(D_BODY_D, 18, 46, 6, 4); R(D_SPEC, 19, 44, 4, 2);
  R(D_WING, 39, 34, 8, 16); R(D_BODY_D, 40, 46, 6, 4); R(D_SPEC, 41, 44, 4, 2);
  // pointed black tail with pale edges
  C(D_TAIL, 50, 8, 7); C(D_TAIL, 56, 4, 2); R(D_COLLAR, 26, 51, 2, 5); R(D_COLLAR, 36, 51, 2, 5);
  // head from behind
  C(D_COLLAR, 24, 18, 3);
  C(D_HEAD, 6, 14, 2); C(D_HEAD, 8, 18, 4); C(D_HEAD, 11, 20, 13); C(D_HEAD_L, 9, 8, 3);
}

// ── Stone Golem: a stacked cairn ────────────────────────────────────────────

const S1 = 0x8d8a86, S1D = 0x6a6865, S1L = 0xaaa7a2, MOSS = 0x5f8a3f, MOSS_D = 0x46692e, S_OUT = 0x3a3834;
const EYE_A = 0xffb02e, EYE_AL = 0xffe08a;

function cairn(R: Rect, face: boolean): void {
  const C = (c: number, y: number, w: number, h: number) => R(c, 32 - w / 2, y, w, h);
  C(0x2a2634, 59, 40, 2);
  // four stacked stones
  C(S_OUT, 42, 42, 17); C(S1, 43, 40, 15); C(S1D, 52, 40, 6); R(S1L, 14, 45, 8, 3);
  C(S_OUT, 29, 32, 15); C(S1, 30, 30, 13); C(S1D, 38, 30, 5); R(S1L, 19, 32, 6, 3);
  C(S_OUT, 17, 24, 14); C(S1, 18, 22, 12); C(S1D, 26, 22, 4); R(S1L, 23, 19, 5, 2);
  C(S_OUT, 5, 18, 14); C(S1, 6, 16, 12); C(S1L, 7, 8, 3); C(S1D, 15, 16, 3);
  // cracks and moss
  R(S_OUT, 26, 46, 1, 6); R(S_OUT, 27, 51, 3, 1); R(S_OUT, 38, 33, 1, 4);
  R(MOSS, 15, 43, 9, 3); R(MOSS_D, 17, 45, 5, 2); R(MOSS, 40, 30, 7, 3); R(MOSS_D, 42, 32, 3, 1);
  R(MOSS, 27, 5, 10, 3); R(MOSS_D, 29, 7, 6, 2); R(MOSS, 24, 8, 3, 2);
  if (face) {
    // a single glowing eye in the top stone
    R(S_OUT, 26, 11, 12, 8); R(EYE_A, 28, 12, 8, 6); R(EYE_AL, 30, 13, 3, 2); R(S_OUT, 32, 14, 2, 3);
  }
  // detached floating fists + orbiting pebbles
  R(S_OUT, 3, 30, 13, 13); R(S1, 4, 31, 11, 11); R(S1L, 5, 32, 4, 3); R(S1D, 4, 38, 11, 4);
  R(S_OUT, 48, 30, 13, 13); R(S1, 49, 31, 11, 11); R(S1L, 50, 32, 4, 3); R(S1D, 49, 38, 11, 4);
  R(S1D, 8, 20, 3, 3); R(S1D, 53, 22, 3, 3); R(S1, 12, 47, 2, 2); R(S1, 50, 49, 2, 2);
}
export const drawGolemFront = (g: G): void => cairn(rects(g), true);
export const drawGolemBack = (g: G): void => cairn(rects(g), false);

// ── River Pike: a long side-on fish ─────────────────────────────────────────

const P_BACK = 0x4f7a3a, P_BACK_D = 0x365a2a, P_SIDE = 0x8fae6a, P_BELLY = 0xe6e2c4, P_FIN = 0xc8603a, P_FIN_D = 0x9a4528;
const P_EYE = 0xf0d040, P_SPOT = 0xd8c870, P_DARK = 0x1a1a1a;

/** [dir] 1 = facing right (front sprite), -1 = facing left (back sprite). */
function pike(g: G, dir: 1 | -1): void {
  const R0 = rects(g); const R = dir === 1 ? R0 : mirrored(R0);
  R(0x2a2634, 10, 58, 44, 2);
  // forked tail + peduncle
  R(P_FIN, 2, 23, 9, 7); R(P_FIN_D, 3, 27, 7, 2); R(P_FIN, 2, 36, 9, 7); R(P_FIN_D, 3, 36, 7, 2);
  R(P_BACK_D, 8, 29, 6, 8);
  // dorsal and anal fins
  R(P_FIN, 36, 19, 10, 7); R(P_FIN_D, 37, 23, 8, 2); R(P_FIN, 20, 42, 9, 5);
  // long body: olive back, sage flank, cream belly
  R(P_BACK_D, 14, 25, 34, 2); R(P_BACK, 12, 26, 38, 5);
  R(P_SIDE, 11, 31, 40, 5); R(P_BELLY, 13, 36, 36, 4); R(P_SIDE, 15, 40, 28, 1);
  // pointed snout with a toothy mouth
  R(P_BACK, 50, 28, 4, 6); R(P_SIDE, 50, 34, 4, 3); R(P_BACK, 54, 30, 5, 4); R(P_SIDE, 54, 34, 4, 2);
  R(P_DARK, 49, 35, 9, 1); R(0xffffff, 51, 36, 1, 2); R(0xffffff, 54, 36, 1, 2); R(0xffffff, 57, 36, 1, 1);
  // vertical bars, pale spots, gill line, pectoral fin
  for (const x of [18, 24, 30, 36]) R(P_BACK_D, x, 27, 2, 9);
  for (const [x, y] of [[20, 32], [27, 33], [34, 32], [41, 33]] as [number, number][]) R(P_SPOT, x, y, 2, 2);
  R(P_BACK_D, 43, 29, 1, 9);
  R(P_FIN, 38, 38, 7, 4); R(P_FIN_D, 39, 40, 5, 1);
  // eye
  R(P_DARK, 46, 28, 6, 6); R(P_EYE, 47, 29, 4, 4); R(P_DARK, 48, 30, 2, 2);
}
export const drawPikeFront = (g: G): void => pike(g, 1);
export const drawPikeBack = (g: G): void => pike(g, -1);

// ── Cave Bat: furred body, wings on finger bones ────────────────────────────

const B_FUR = 0x5a4a44, B_FUR_D = 0x3e322e, B_FUR_L = 0x7a6a62, B_MEM = 0x3d3a56, B_MEM_D = 0x2a2840;
const B_MEM_L = 0x544f78, B_BONE = 0x6a5a58, B_EAR = 0xc98a8a, B_EYE = 0xff6a3a, B_FANG = 0xf4f4f0;

/** One wing (left side); the caller mirrors it for the right. */
function batWing(R: Rect, dark: boolean): void {
  const mem = dark ? B_MEM_D : B_MEM, hi = dark ? B_MEM : B_MEM_L;
  const shoulderX = 21, shoulderY = 28, tipX = 2, tipY = 14;
  // membrane columns between the arm bone (top) and a scalloped trailing edge (bottom)
  for (let x = tipX; x <= shoulderX; x++) {
    const top = Math.round(tipY + ((x - tipX) * (shoulderY - tipY)) / (shoulderX - tipX));
    const scallop = 5 * Math.abs(Math.sin(((x - 3) * Math.PI) / 6));
    const bottom = Math.round(46 - scallop - (x < 10 ? (10 - x) * 0.7 : 0));
    if (bottom > top + 1) { R(mem, x, top + 1, 1, bottom - top - 1); R(hi, x, top + 1, 1, 2); }
  }
  // arm bone and three finger bones fanning out to the wing tips
  line(R, B_BONE, shoulderX, shoulderY, tipX, tipY, 2);
  for (const [fx, fy] of [[3, 34], [9, 44], [16, 45]] as [number, number][]) line(R, B_BONE, shoulderX - 1, shoulderY + 1, fx, fy);
}

function bat(g: G, front: boolean): void {
  const R0 = rects(g); const Rm = mirrored(R0);
  const C = (c: number, y: number, w: number, h: number) => R0(c, 32 - w / 2, y, w, h);
  C(0x2a2634, 60, 22, 2);
  batWing(R0, !front); batWing(Rm, !front);
  // furred body, feet
  C(B_FUR_D, 23, 14, 23); C(B_FUR, 24, 12, 21);
  if (front) C(B_FUR_L, 31, 8, 11); else C(B_FUR_D, 28, 2, 14);
  R0(B_FUR_D, 26, 45, 3, 6); R0(B_FUR_D, 35, 45, 3, 6);
  R0(B_BONE, 25, 50, 2, 2); R0(B_BONE, 37, 50, 2, 2);
  // head with large pointed ears
  R0(B_FUR_D, 20, 1, 7, 14); R0(B_FUR_D, 37, 1, 7, 14);
  C(B_FUR_D, 8, 14, 3); C(B_FUR_D, 10, 18, 16); C(B_FUR, 9, 12, 3); C(B_FUR, 11, 16, 14);
  if (front) {
    R0(B_EAR, 22, 4, 3, 9); R0(B_EAR, 39, 4, 3, 9);
    R0(B_EYE, 25, 16, 4, 4); R0(B_EYE, 35, 16, 4, 4); R0(0x1a1a1a, 26, 17, 2, 2); R0(0x1a1a1a, 36, 17, 2, 2);
    C(B_FUR_D, 21, 5, 4); R0(B_FANG, 28, 24, 2, 4); R0(B_FANG, 34, 24, 2, 4); C(0x1a1a1a, 24, 6, 2);
  } else {
    C(B_FUR, 4, 10, 5); C(B_FUR_L, 12, 6, 3);
  }
}
export const drawBatFront = (g: G): void => bat(g, true);
export const drawBatBack = (g: G): void => bat(g, false);

// ── Hedge Sprite / Briar Sprite: a leafy bush spirit ────────────────────────

export interface HedgePalette {
  leaf: number; leafD: number; leafL: number; flower: number; flowerL: number; bark: number; thorns?: boolean;
}
export const HEDGE_PAL: HedgePalette = { leaf: 0x4f9a46, leafD: 0x37722f, leafL: 0x7cc46a, flower: 0xf59ac0, flowerL: 0xffc8dc, bark: 0x7a5232 };
export const BRIAR_PAL: HedgePalette = { leaf: 0x2f5a46, leafD: 0x1f3d30, leafL: 0x4f8a64, flower: 0xd8344a, flowerL: 0xff7a8a, bark: 0x5a3a24, thorns: true };

function hedge(g: G, pal: HedgePalette, front: boolean): void {
  const R = rects(g); const C = (c: number, y: number, w: number, h: number) => R(c, 32 - w / 2, y, w, h);
  C(0x2a2634, 59, 30, 2);
  // twig legs with root feet
  R(pal.bark, 22, 50, 4, 8); R(pal.bark, 38, 50, 4, 8);
  R(pal.bark, 19, 57, 8, 2); R(pal.bark, 37, 57, 8, 2);
  // round bush body, scanline by scanline
  for (let y = 18; y <= 52; y++) {
    const t = (y - 35) / 17.5, hw = Math.round(19 * Math.sqrt(Math.max(0, 1 - t * t)));
    if (hw > 0) C(y > 44 ? pal.leafD : pal.leaf, y, hw * 2, 1);
  }
  // leafy nubs around the outline + lit patches
  for (let a = 0; a < 360; a += 24) {
    const x = 32 + Math.round(21 * Math.cos((a * Math.PI) / 180)), y = 35 + Math.round(18 * Math.sin((a * Math.PI) / 180));
    R(a % 48 === 0 ? pal.leafL : pal.leafD, x - 2, y - 2, 4, 4);
  }
  for (const [x, y] of [[20, 24], [26, 20], [40, 22], [18, 34], [44, 32], [24, 46], [40, 46]] as [number, number][]) R(pal.leafL, x, y, 3, 2);
  if (pal.thorns) for (const [x, y] of [[13, 30], [49, 28], [15, 42], [47, 42], [30, 16], [38, 17]] as [number, number][]) { R(pal.bark, x, y, 2, 4); R(pal.bark, x + 1, y - 1, 1, 1); }
  // twig arms with leaf hands
  R(pal.bark, 10, 32, 8, 3); R(pal.leafL, 6, 30, 5, 5);
  R(pal.bark, 46, 32, 8, 3); R(pal.leafL, 53, 30, 5, 5);
  if (front) {
    // big friendly eyes, little smile, blush
    R(0xffffff, 22, 28, 8, 8); R(0x1a1a1a, 25, 30, 4, 5); R(0xffffff, 26, 31, 2, 2);
    R(0xffffff, 34, 28, 8, 8); R(0x1a1a1a, 37, 30, 4, 5); R(0xffffff, 38, 31, 2, 2);
    R(0x1a1a1a, 28, 39, 8, 1); R(0x1a1a1a, 27, 38, 1, 1); R(0x1a1a1a, 36, 38, 1, 1);
    R(pal.flower, 18, 37, 5, 3); R(pal.flower, 41, 37, 5, 3);
  } else {
    R(pal.leafL, 24, 26, 16, 3); R(pal.leafD, 22, 40, 20, 3);
    R(pal.bark, 30, 44, 4, 8); R(pal.leafL, 27, 50, 10, 3);                    // leafy tail
  }
  // flower crown
  R(pal.flower, 27, 6, 10, 10); R(pal.flower, 24, 9, 16, 4); R(pal.flowerL, 29, 7, 4, 3);
  R(0xffe14a, 30, 9, 4, 4); R(pal.leafD, 30, 15, 4, 4);
}
export const drawHedgeFront = (pal: HedgePalette) => (g: G): void => hedge(g, pal, true);
export const drawHedgeBack = (pal: HedgePalette) => (g: G): void => hedge(g, pal, false);
