import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// Spark Imp: a small mischievous yellow imp crackling with electricity, zigzag lightning tail.
const SKIN = ramp(0x8a5a0c, 0xe8b01c, 0xfff08c);
const BELLY = ramp(0xb89030, 0xf6d860, 0xfffbc0, 4);
const EAR_IN = ramp(0x8a3018, 0xd8602c, 0xf8a060, 4);
const CHEEK = ramp(0x8a1818, 0xd83a2c, 0xff8a70, 4);
const BOLT = ramp(0x2a62c8, 0x7ac4ff, 0xf4fdff, 4);
const EYE_W = ramp(0xb8c8d8, 0xeaf4ff, 0xffffff, 3);
const IRIS = ramp(0x0c1a50, 0x2a4ad8, 0x7aa8ff, 4);

export function drawImpFront(c: PixelCanvas): void {
  // lightning tail behind the body, to the right
  c.poly([[42, 52], [53, 40], [47, 40], [59, 22], [45, 37], [51, 37], [39, 49]], BOLT, { puff: 1.2 });
  // legs and feet
  c.capsule(26, 52, 4.2, 25, 58, 3.6, SKIN, { texture: 0.2, seed: 2 });
  c.capsule(38, 52, 4.2, 39, 58, 3.6, SKIN, { texture: 0.2, seed: 3 });
  c.ellipse(24, 59.5, 5, 2.2, SKIN);
  c.ellipse(40, 59.5, 5, 2.2, SKIN);
  // body + belly
  c.ellipse(32, 45, 12, 11.5, SKIN, { texture: 0.25, seed: 4 });
  c.ellipse(32, 47, 7, 7, BELLY, { texture: 0.2, seed: 5 });
  // arms (one raised, crackling)
  c.capsule(21, 41, 3.4, 15, 47, 3, SKIN, { texture: 0.2, seed: 6 });
  c.capsule(43, 41, 3.4, 49, 33, 3, SKIN, { texture: 0.2, seed: 7 });
  c.ellipse(14, 49, 3.2, 3, SKIN);
  c.ellipse(50, 31, 3.4, 3.2, SKIN);
  // pointed ears behind the head
  c.poly([[22, 28], [6, 14], [8, 26], [10, 30]], SKIN, { puff: 0.7 });
  c.poly([[42, 28], [58, 14], [56, 26], [54, 30]], SKIN, { puff: 0.7 });
  c.poly([[20, 26], [11, 18], [12, 26]], EAR_IN, { puff: 0.5, edge: false });
  c.poly([[44, 26], [53, 18], [52, 26]], EAR_IN, { puff: 0.5, edge: false });
  // head with a spiky tuft
  c.poly([[26, 14], [29, 5], [32, 13], [35, 4], [38, 14]], SKIN, { puff: 0.6 });
  c.ellipse(32, 27, 13, 12, SKIN, { texture: 0.2, seed: 8 });
  // cheeks, eyes, grin
  c.ellipse(21, 32, 3.2, 3.2, CHEEK, { flat: 0.4 });
  c.ellipse(43, 32, 3.2, 3.2, CHEEK, { flat: 0.4 });
  c.ellipse(26, 24, 4, 4.6, EYE_W, { flat: 0.7, edge: false });
  c.ellipse(38, 24, 4, 4.6, EYE_W, { flat: 0.7, edge: false });
  c.ellipse(26.6, 25, 2.2, 2.8, IRIS, { flat: 0.3, edge: false });
  c.ellipse(37.4, 25, 2.2, 2.8, IRIS, { flat: 0.3, edge: false });
  c.px(26, 24, 0x04060c); c.px(37, 24, 0x04060c);
  c.px(25.5, 23, 0xffffff); c.px(36.5, 23, 0xffffff);
  c.rect(27, 31, 10, 1, 0x4a2008);
  c.rect(28, 32, 8, 2, 0x8a1818);
  c.rect(29, 32, 1, 1, 0xfffbe8); c.rect(34, 32, 1, 1, 0xfffbe8);
  c.outline();
  // sparks
  for (const [x, y] of [[8, 40], [57, 24], [48, 20], [12, 12], [60, 40]]) { c.px(x, y, 0xffffff); c.px(x + 1, y, 0x9ad4ff); c.px(x, y + 1, 0x9ad4ff); }
}

export function drawImpBack(c: PixelCanvas): void {
  c.poly([[24, 53], [12, 41], [18, 41], [5, 24], [19, 38], [13, 38], [27, 50]], BOLT, { puff: 1.2 });
  c.capsule(26, 52, 4.2, 25, 58, 3.6, SKIN, { texture: 0.2, seed: 12 });
  c.capsule(38, 52, 4.2, 39, 58, 3.6, SKIN, { texture: 0.2, seed: 13 });
  c.ellipse(24, 59.5, 5, 2.2, SKIN);
  c.ellipse(40, 59.5, 5, 2.2, SKIN);
  c.ellipse(32, 45, 13, 12, SKIN, { texture: 0.3, seed: 14 });
  c.capsule(20, 42, 3.4, 15, 49, 3, SKIN, { texture: 0.2, seed: 15 });
  c.capsule(44, 42, 3.4, 49, 49, 3, SKIN, { texture: 0.2, seed: 16 });
  c.poly([[22, 28], [6, 14], [8, 26], [10, 30]], SKIN, { puff: 0.7 });
  c.poly([[42, 28], [58, 14], [56, 26], [54, 30]], SKIN, { puff: 0.7 });
  c.poly([[26, 14], [29, 5], [32, 13], [35, 4], [38, 14]], SKIN, { puff: 0.6 });
  c.ellipse(32, 27, 13, 12, SKIN, { texture: 0.25, seed: 17 });
  c.outline();
  for (const [x, y] of [[54, 22], [10, 22], [50, 52]]) { c.px(x, y, 0xffffff); c.px(x + 1, y, 0x9ad4ff); c.px(x, y + 1, 0x9ad4ff); }
}
