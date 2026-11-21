import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// Cave Bat: a purple-grey bat with huge ears, leathery wings and a toxic green glow on the wing tips.
const FUR = ramp(0x1c1426, 0x4a3a62, 0x9a88b8);
const WING = ramp(0x24143a, 0x5a3a82, 0xb08ad8, 4);
const BONE = ramp(0x1c1020, 0x3a2a4a, 0x6a5a82, 3);
const GLOW = ramp(0x2a7a18, 0x7ae83a, 0xf0ffb0, 3);
const EYE = ramp(0x80a000, 0xe8ff30, 0xffffff, 3);
const FANG = ramp(0xb0b0a0, 0xf0f0e0, 0xffffff, 3);

export function drawBatFront(c: PixelCanvas): void {
  // wings spread wide: scalloped bottom edge, bones as dark lines
  c.poly([[23, 32], [8, 14], [4, 28], [1, 38], [8, 36], [9, 46], [16, 42], [19, 50], [24, 42]], WING, { texture: 0.25, seed: 2, puff: 0.5 });
  c.poly([[41, 32], [56, 14], [60, 28], [63, 38], [56, 36], [55, 46], [48, 42], [45, 50], [40, 42]], WING, { texture: 0.25, seed: 3, puff: 0.5 });
  c.line(23, 32, 8, 14, 0x2a1a3a); c.line(23, 33, 4, 28, 0x2a1a3a); c.line(23, 34, 9, 46, 0x2a1a3a); c.line(23, 34, 19, 50, 0x2a1a3a);
  c.line(41, 32, 56, 14, 0x2a1a3a); c.line(41, 33, 60, 28, 0x2a1a3a); c.line(41, 34, 55, 46, 0x2a1a3a); c.line(41, 34, 45, 50, 0x2a1a3a);
  for (const [x, y] of [[8, 14], [3, 29], [9, 46], [56, 14], [61, 29], [55, 46]]) { c.ellipse(x, y, 1.8, 1.8, GLOW, { edge: false }); }
  // hanging feet
  c.capsule(29, 52, 1.8, 28, 59, 1.6, BONE, { edge: false });
  c.capsule(35, 52, 1.8, 36, 59, 1.6, BONE, { edge: false });
  // fuzzy body and head
  c.ellipse(32, 41, 9.5, 12, FUR, { texture: 0.5, seed: 4 });
  c.ellipse(32, 44, 5.5, 7.5, ramp(0x3a2c4a, 0x7a68a0, 0xc4b4e0, 4), { texture: 0.4, seed: 5 });
  // huge ears
  c.poly([[24, 24], [17, 5], [29, 17]], FUR, { puff: 0.7, texture: 0.3, seed: 6 });
  c.poly([[40, 24], [47, 5], [35, 17]], FUR, { puff: 0.7, texture: 0.3, seed: 7 });
  c.poly([[24, 21], [19, 9], [27, 17]], ramp(0x6a2a4a, 0xc05a88, 0xf0a0c0, 3), { flat: 0.5, edge: false });
  c.poly([[40, 21], [45, 9], [37, 17]], ramp(0x6a2a4a, 0xc05a88, 0xf0a0c0, 3), { flat: 0.5, edge: false });
  c.ellipse(32, 27, 10, 9, FUR, { texture: 0.4, seed: 8 });
  // snout, eyes, fangs
  c.ellipse(32, 31, 5, 3.6, ramp(0x2c2038, 0x5a4a72, 0x9a88b8, 4));
  c.px(30, 30, 0x100818); c.px(33, 30, 0x100818);
  c.ellipse(27, 25.5, 2.4, 2.6, EYE, { edge: false, flat: 0.4 });
  c.ellipse(37, 25.5, 2.4, 2.6, EYE, { edge: false, flat: 0.4 });
  c.px(27, 25, 0x101800); c.px(37, 25, 0x101800);
  c.poly([[29, 33], [31, 33], [30, 37]], FANG, { edge: false, flat: 0.3 });
  c.poly([[33, 33], [35, 33], [34, 37]], FANG, { edge: false, flat: 0.3 });
  c.outline();
}

export function drawBatBack(c: PixelCanvas): void {
  c.poly([[23, 30], [8, 12], [3, 28], [1, 40], [9, 37], [11, 48], [18, 43], [22, 52], [25, 42]], WING, { texture: 0.25, seed: 12, puff: 0.5 });
  c.poly([[41, 30], [56, 12], [61, 28], [63, 40], [55, 37], [53, 48], [46, 43], [42, 52], [39, 42]], WING, { texture: 0.25, seed: 13, puff: 0.5 });
  c.line(23, 30, 8, 12, 0x2a1a3a); c.line(23, 31, 3, 28, 0x2a1a3a); c.line(23, 32, 11, 48, 0x2a1a3a);
  c.line(41, 30, 56, 12, 0x2a1a3a); c.line(41, 31, 61, 28, 0x2a1a3a); c.line(41, 32, 53, 48, 0x2a1a3a);
  for (const [x, y] of [[8, 12], [3, 28], [11, 48], [56, 12], [61, 28], [53, 48]]) { c.ellipse(x, y, 1.8, 1.8, GLOW, { edge: false }); }
  c.ellipse(32, 41, 10, 13, FUR, { texture: 0.6, seed: 14 });
  c.poly([[24, 24], [17, 5], [29, 17]], FUR, { puff: 0.7, texture: 0.3, seed: 15 });
  c.poly([[40, 24], [47, 5], [35, 17]], FUR, { puff: 0.7, texture: 0.3, seed: 16 });
  c.ellipse(32, 27, 10, 9, FUR, { texture: 0.5, seed: 17 });
  c.outline();
}
