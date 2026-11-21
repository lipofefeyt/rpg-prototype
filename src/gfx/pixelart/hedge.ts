import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// Hedge Sprite: a leafy bush creature with a dark face, glowing eyes, twig arms and pink buds.
const LEAF = ramp(0x103a14, 0x2e7a2a, 0x88d058);
const LEAF_L = ramp(0x1a4a1a, 0x4a9a38, 0xb0e868, 4);
const TWIG = ramp(0x2a1a0e, 0x6a4424, 0xb08048, 4);
const FACE = ramp(0x04100a, 0x0c2014, 0x1c3a26, 3);
const EYE = ramp(0xc08000, 0xffe040, 0xffffff, 3);
const BUD = ramp(0x8a2a50, 0xe85a90, 0xffb0d0, 4);

function leaves(c: PixelCanvas, seed: number): void {
  const spots: [number, number, number, number][] = [
    [16, 36, 8, 7], [48, 36, 8, 7], [20, 28, 7, 6], [44, 28, 7, 6], [32, 17, 9, 7], [24, 20, 6, 5], [40, 20, 6, 5],
    [14, 46, 7, 6], [50, 46, 7, 6], [32, 52, 12, 6], [22, 52, 7, 5], [42, 52, 7, 5],
  ];
  spots.forEach(([x, y, rx, ry], i) => c.ellipse(x, y, rx, ry, i % 2 ? LEAF_L : LEAF, { texture: 0.6, seed: seed + i }));
}

export function hedgeFrontBody(c: PixelCanvas): void {
  // little root feet
  c.capsule(25, 54, 3, 24, 60, 2.6, TWIG, { texture: 0.3, seed: 2 });
  c.capsule(39, 54, 3, 40, 60, 2.6, TWIG, { texture: 0.3, seed: 3 });
  // twig arms
  c.capsule(15, 40, 1.8, 6, 50, 1.4, TWIG, { edge: false });
  c.capsule(49, 40, 1.8, 58, 50, 1.4, TWIG, { edge: false });
  c.capsule(6, 50, 1.4, 4, 47, 1, TWIG, { edge: false }); c.capsule(6, 50, 1.4, 8, 54, 1, TWIG, { edge: false });
  c.capsule(58, 50, 1.4, 60, 47, 1, TWIG, { edge: false }); c.capsule(58, 50, 1.4, 56, 54, 1, TWIG, { edge: false });
  // main leafy body
  c.ellipse(32, 38, 19, 18, LEAF, { texture: 0.6, seed: 4 });
  leaves(c, 10);
  // face cavity
  c.ellipse(32, 38, 11, 9.5, FACE, { flat: 0.3, edge: false });
  c.ellipse(27, 36, 2.8, 3.2, EYE, { edge: false, flat: 0.4 });
  c.ellipse(37, 36, 2.8, 3.2, EYE, { edge: false, flat: 0.4 });
  c.px(27, 36, 0x201000); c.px(37, 36, 0x201000);
  c.rect(28, 43, 8, 1.2, 0x2c5a38);
  // flower buds
  for (const [x, y] of [[20, 22], [44, 24], [30, 14], [12, 38], [53, 42]]) {
    c.ellipse(x, y, 2.6, 2.6, BUD, { edge: false }); c.px(x, y, 0xfff0a0);
  }
}

export function drawHedgeFront(c: PixelCanvas): void {
  hedgeFrontBody(c);
  c.outline();
}

export function hedgeBackBody(c: PixelCanvas): void {
  c.capsule(25, 54, 3, 24, 60, 2.6, TWIG, { texture: 0.3, seed: 12 });
  c.capsule(39, 54, 3, 40, 60, 2.6, TWIG, { texture: 0.3, seed: 13 });
  c.ellipse(32, 38, 20, 19, LEAF, { texture: 0.6, seed: 14 });
  leaves(c, 30);
  c.ellipse(32, 36, 12, 11, LEAF_L, { texture: 0.7, seed: 15, edge: false, bias: 0.3 });
  for (const [x, y] of [[22, 24], [42, 26], [32, 16], [13, 40], [52, 44], [30, 46]]) {
    c.ellipse(x, y, 2.6, 2.6, BUD, { edge: false }); c.px(x, y, 0xfff0a0);
  }
}

export function drawHedgeBack(c: PixelCanvas): void {
  hedgeBackBody(c);
  c.outline();
}

// Briar Sprite: the hedge sprite gone dark and thorny - teal-black leaves, red buds, bone thorns.
function thorny(r: number, g: number, b: number): [number, number, number] {
  if (r > 150 && g < 120) return [r, g * 0.7, b * 0.8];          // buds stay pink/red
  if (r > 200 && g > 200) return [r, g, b * 0.9];                 // yellow eyes stay
  return [r * 0.7, g * 0.52, g * 0.46 + b * 0.2];
}
const THORN = ramp(0x8a8a70, 0xe8e4c8, 0xffffff, 3);
function thorns(c: PixelCanvas): void {
  const pts: [number, number, number, number][] = [[14, 26, -7, -5], [50, 26, 7, -5], [8, 40, -8, 0], [56, 40, 8, 0], [18, 52, -6, 4], [46, 52, 6, 4], [32, 17, 0, -8], [24, 19, -4, -7], [40, 19, 4, -7]];
  for (const [x, y, dx, dy] of pts) {
    const nx = -dy, ny = dx, m = Math.hypot(nx, ny) || 1;
    c.poly([[x + (nx / m) * 2.2, y + (ny / m) * 2.2], [x + dx, y + dy], [x - (nx / m) * 2.2, y - (ny / m) * 2.2]], THORN, { flat: 0.3, puff: 0.6 });
  }
}
export function drawBriarFront(c: PixelCanvas): void { hedgeFrontBody(c); c.recolor(thorny); thorns(c); c.outline(); }
export function drawBriarBack(c: PixelCanvas): void { hedgeBackBody(c); c.recolor(thorny); thorns(c); c.outline(); }
