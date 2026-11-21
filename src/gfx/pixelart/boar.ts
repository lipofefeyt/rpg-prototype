import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// Tusked Boar: a stocky brown boar with a bristly ridge, a pink snout and big curved tusks.
const HIDE = ramp(0x2c1a10, 0x7a4a2a, 0xc08a58);
const HIDE_D = ramp(0x1c1008, 0x52301a, 0x8a5a34, 4);
const SNOUT = ramp(0x8a4a50, 0xd88a90, 0xf8c8cc, 4);
const TUSK = ramp(0xa8a080, 0xf0ead0, 0xffffff, 4);
const NOSTRIL = ramp(0x1a0808, 0x3a1418, 0x5a2a2c, 3);
const HOOF = ramp(0x0c0804, 0x2a1c14, 0x5a4636, 3);

export function drawBoarFront(c: PixelCanvas): void {
  // hooves and legs
  c.capsule(22, 50, 4.8, 21, 57, 4.4, HIDE_D, { texture: 0.4, seed: 2 });
  c.capsule(42, 50, 4.8, 43, 57, 4.4, HIDE_D, { texture: 0.4, seed: 3 });
  c.ellipse(21, 59.5, 5.4, 2.4, HOOF); c.ellipse(43, 59.5, 5.4, 2.4, HOOF);
  // thick body with bristle ridge on top
  c.ellipse(32, 42, 19, 14, HIDE, { texture: 0.5, seed: 4 });
  c.poly([[16, 36], [20, 26], [24, 34], [28, 24], [32, 33], [36, 24], [40, 34], [44, 26], [48, 36]], HIDE_D, { texture: 0.6, seed: 5, puff: 0.6 });
  // ears
  c.poly([[20, 22], [14, 12], [27, 17]], HIDE, { puff: 0.8, texture: 0.3, seed: 6 });
  c.poly([[44, 22], [50, 12], [37, 17]], HIDE, { puff: 0.8, texture: 0.3, seed: 7 });
  // big head, snout disc
  c.ellipse(32, 31, 14, 12, HIDE, { texture: 0.5, seed: 8 });
  c.ellipse(32, 37, 8, 6, SNOUT, { texture: 0.2, seed: 9 });
  c.ellipse(29.5, 37, 1.4, 1.8, NOSTRIL, { edge: false, flat: 0.5 });
  c.ellipse(34.5, 37, 1.4, 1.8, NOSTRIL, { edge: false, flat: 0.5 });
  // tusks curving up from the jaw
  c.poly([[22, 40], [18, 36], [14, 38], [20, 46], [24, 44]], TUSK, { puff: 0.9, flat: 0.2 });
  c.poly([[42, 40], [46, 36], [50, 38], [44, 46], [40, 44]], TUSK, { puff: 0.9, flat: 0.2 });
  // small angry eyes
  c.ellipse(25.5, 28.5, 2, 1.8, ramp(0x300000, 0xd02818, 0xff9080, 3), { edge: false, flat: 0.3 });
  c.ellipse(38.5, 28.5, 2, 1.8, ramp(0x300000, 0xd02818, 0xff9080, 3), { edge: false, flat: 0.3 });
  c.px(25, 28, 0x100000); c.px(38, 28, 0x100000);
  c.line(22, 25, 28, 27, 0x1c1008); c.line(42, 25, 36, 27, 0x1c1008);
  c.outline();
}

export function drawBoarBack(c: PixelCanvas): void {
  c.capsule(22, 50, 4.8, 21, 57, 4.4, HIDE_D, { texture: 0.4, seed: 12 });
  c.capsule(42, 50, 4.8, 43, 57, 4.4, HIDE_D, { texture: 0.4, seed: 13 });
  c.ellipse(21, 59.5, 5.4, 2.4, HOOF); c.ellipse(43, 59.5, 5.4, 2.4, HOOF);
  c.ellipse(32, 42, 20, 15, HIDE, { texture: 0.5, seed: 14 });
  c.poly([[15, 38], [20, 24], [24, 34], [28, 22], [32, 33], [36, 22], [40, 34], [44, 24], [49, 38]], HIDE_D, { texture: 0.6, seed: 15, puff: 0.6 });
  c.capsule(32, 52, 1.4, 38, 56, 1, HIDE_D, { edge: false });
  c.poly([[20, 22], [14, 12], [27, 17]], HIDE, { puff: 0.8, texture: 0.3, seed: 16 });
  c.poly([[44, 22], [50, 12], [37, 17]], HIDE, { puff: 0.8, texture: 0.3, seed: 17 });
  c.ellipse(32, 30, 13.5, 11, HIDE, { texture: 0.5, seed: 18 });
  c.outline();
}
