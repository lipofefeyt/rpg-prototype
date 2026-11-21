import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// Dire Wolf: a snarling charcoal wolf with a shaggy mane, glowing amber eyes and bared fangs.
const FUR = ramp(0x0c0c14, 0x3a3a48, 0x8c8c9e);
const FUR_L = ramp(0x1a1a24, 0x54546a, 0xb0b0c4, 4);
const MUZZLE = ramp(0x34343e, 0x7c7c8c, 0xc8c8d6, 4);
const EYE = ramp(0xa04000, 0xffb020, 0xfff4a0, 3);
const FANG = ramp(0xa8a898, 0xf0f0e0, 0xffffff, 3);
const MOUTH = ramp(0x2a0608, 0x8a1c24, 0xd04858, 3);

export function drawWolfFront(c: PixelCanvas): void {
  // tail behind
  c.capsule(46, 50, 3, 56, 44, 3.4, FUR, { texture: 0.6, seed: 2 });
  c.capsule(56, 44, 3.4, 59, 36, 2, FUR, { texture: 0.6, seed: 3 });
  // front legs and paws
  c.capsule(23, 48, 4.4, 21, 58, 4, FUR, { texture: 0.6, seed: 4 });
  c.capsule(41, 48, 4.4, 43, 58, 4, FUR, { texture: 0.6, seed: 5 });
  c.ellipse(21, 60, 5.4, 2.6, FUR_L, { texture: 0.5, seed: 6 });
  c.ellipse(43, 60, 5.4, 2.6, FUR_L, { texture: 0.5, seed: 7 });
  // body, shaggy chest
  c.ellipse(32, 44, 17, 12, FUR, { texture: 0.7, seed: 8 });
  c.poly([[18, 40], [24, 52], [28, 44], [32, 55], [36, 44], [40, 52], [46, 40], [32, 34]], FUR_L, { texture: 0.7, seed: 9, puff: 0.6 });
  // ears and mane spikes
  c.poly([[18, 22], [16, 6], [28, 16]], FUR, { puff: 0.8, texture: 0.4, seed: 10 });
  c.poly([[46, 22], [48, 6], [36, 16]], FUR, { puff: 0.8, texture: 0.4, seed: 11 });
  c.poly([[20, 26], [10, 28], [16, 34], [8, 40], [20, 38]], FUR_L, { texture: 0.7, seed: 12, puff: 0.6 });
  c.poly([[44, 26], [54, 28], [48, 34], [56, 40], [44, 38]], FUR_L, { texture: 0.7, seed: 13, puff: 0.6 });
  // head, muzzle, open snarl
  c.ellipse(32, 27, 13, 11, FUR, { texture: 0.6, seed: 14 });
  c.ellipse(32, 34, 8, 6, MUZZLE, { texture: 0.4, seed: 15 });
  c.ellipse(32, 38, 6, 3, MOUTH, { edge: false, flat: 0.3 });
  c.poly([[26, 36], [28, 36], [27, 41]], FANG, { edge: false, flat: 0.2 });
  c.poly([[36, 36], [38, 36], [37, 41]], FANG, { edge: false, flat: 0.2 });
  c.poly([[30, 39], [32, 39], [31, 42]], FANG, { edge: false, flat: 0.2 });
  c.ellipse(32, 31, 3, 2.2, ramp(0x08080c, 0x1c1c24, 0x40404c, 3), { edge: false });
  // eyes
  c.poly([[22, 23], [29, 25], [28, 28], [22, 27]], EYE, { edge: false, flat: 0.3 });
  c.poly([[42, 23], [35, 25], [36, 28], [42, 27]], EYE, { edge: false, flat: 0.3 });
  c.px(26, 26, 0x100400); c.px(38, 26, 0x100400);
  c.outline();
}

export function drawWolfBack(c: PixelCanvas): void {
  c.capsule(44, 46, 3.4, 56, 42, 3.6, FUR, { texture: 0.6, seed: 22 });
  c.capsule(56, 42, 3.6, 60, 32, 2.2, FUR, { texture: 0.6, seed: 23 });
  c.capsule(22, 50, 4.4, 20, 58, 4, FUR, { texture: 0.6, seed: 24 });
  c.capsule(42, 50, 4.4, 44, 58, 4, FUR, { texture: 0.6, seed: 25 });
  c.ellipse(20, 60, 5.4, 2.6, FUR_L, { texture: 0.5, seed: 26 });
  c.ellipse(44, 60, 5.4, 2.6, FUR_L, { texture: 0.5, seed: 27 });
  c.ellipse(32, 42, 18, 13, FUR, { texture: 0.7, seed: 28 });
  c.ellipse(32, 36, 13, 8, FUR_L, { texture: 0.7, seed: 29, edge: false, bias: 0.3 });
  c.poly([[18, 22], [16, 6], [28, 16]], FUR, { puff: 0.8, texture: 0.4, seed: 30 });
  c.poly([[46, 22], [48, 6], [36, 16]], FUR, { puff: 0.8, texture: 0.4, seed: 31 });
  c.poly([[20, 26], [10, 30], [18, 36], [22, 38]], FUR_L, { texture: 0.7, seed: 32, puff: 0.6 });
  c.poly([[44, 26], [54, 30], [46, 36], [42, 38]], FUR_L, { texture: 0.7, seed: 33, puff: 0.6 });
  c.ellipse(32, 26, 12.5, 10.5, FUR, { texture: 0.6, seed: 34 });
  c.outline();
}
