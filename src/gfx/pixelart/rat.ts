import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// Giant Rat: a hunched grey-brown rat with big buck teeth and a long pink tail.
const FUR = ramp(0x3a2c2c, 0x7c6660, 0xc2b0a4);
const BELLY = ramp(0x6e5a56, 0xb09c92, 0xe8dccc);
const EAR = ramp(0x8a4452, 0xd98a98, 0xf6c0c8, 4);
const TAIL = ramp(0x8a4a58, 0xc67c88, 0xeaa8b2, 4);
const NOSE = ramp(0x7a3844, 0xd96c80, 0xf8a4b4, 4);
const PAW = ramp(0x8a4a58, 0xd08a96, 0xf2b8c0, 4);

export function drawRatFront(c: PixelCanvas): void {
  // tail curls out from behind the body to the right
  c.capsule(43, 51, 2.8, 51, 56, 2.5, TAIL);
  c.capsule(51, 56, 2.5, 58, 52, 2.1, TAIL);
  c.capsule(58, 52, 2.1, 60, 45, 1.7, TAIL);
  c.capsule(60, 45, 1.7, 57, 39, 1.2, TAIL);
  // hind feet
  c.ellipse(24, 57, 7, 3.2, PAW);
  c.ellipse(40, 57, 7, 3.2, PAW);
  // body + belly
  c.ellipse(32, 42, 17, 15, FUR, { texture: 0.5, seed: 3 });
  c.ellipse(32, 46, 10, 10, BELLY, { texture: 0.3, seed: 4 });
  // arms
  c.capsule(19, 38, 4.2, 17, 49, 3.6, FUR, { texture: 0.5, seed: 5 });
  c.capsule(45, 38, 4.2, 47, 49, 3.6, FUR, { texture: 0.5, seed: 6 });
  c.ellipse(17, 51, 4.5, 3.2, PAW);
  c.ellipse(47, 51, 4.5, 3.2, PAW);
  // ears sit behind the head
  c.ellipse(21, 15, 7, 8, FUR, { texture: 0.4, seed: 7 });
  c.ellipse(43, 15, 7, 8, FUR, { texture: 0.4, seed: 8 });
  c.ellipse(21, 16, 4.2, 5.4, EAR, { flat: 0.3 });
  c.ellipse(43, 16, 4.2, 5.4, EAR, { flat: 0.3 });
  // head, snout
  c.ellipse(32, 27, 14, 12, FUR, { texture: 0.5, seed: 9 });
  c.ellipse(32, 33, 7.5, 5.5, BELLY, { texture: 0.25, seed: 10 });
  // nose
  c.ellipse(32, 30, 2.6, 2, NOSE);
  // eyes
  c.ellipse(25.5, 24.5, 2.4, 3, ramp(0x000000, 0x1a1218, 0x4a3a44, 3), { edge: false, flat: 0.6 });
  c.ellipse(38.5, 24.5, 2.4, 3, ramp(0x000000, 0x1a1218, 0x4a3a44, 3), { edge: false, flat: 0.6 });
  c.px(24.5, 23, 0xffffff); c.px(37.5, 23, 0xffffff);
  // buck teeth
  c.rect(30, 35, 2, 4, 0xe9e2d0); c.rect(32, 35, 2, 4, 0xfdf9ee);
  c.px(30, 38, 0xb8b0a0); c.px(33, 38, 0xb8b0a0);
  c.outline();
  // whiskers go on after the outline so they stay thin light lines
  const W = 0xe6ddd2;
  c.line(24, 31, 12, 28, W); c.line(24, 33, 11, 33, W); c.line(25, 35, 13, 38, W);
  c.line(40, 31, 52, 28, W); c.line(40, 33, 53, 33, W); c.line(39, 35, 51, 38, W);
}

export function drawRatBack(c: PixelCanvas): void {
  // tail curls out from the rump
  c.capsule(36, 52, 2.8, 44, 57, 2.5, TAIL);
  c.capsule(44, 57, 2.5, 52, 55, 2.1, TAIL);
  c.capsule(52, 55, 2.1, 57, 48, 1.7, TAIL);
  c.capsule(57, 48, 1.7, 55, 41, 1.2, TAIL);
  // hind feet
  c.ellipse(25, 58, 7, 3, PAW);
  c.ellipse(39, 58, 7, 3, PAW);
  // body
  c.ellipse(32, 43, 18, 15, FUR, { texture: 0.5, seed: 21 });
  c.ellipse(31, 40, 11, 8, FUR, { texture: 0.4, seed: 22, bias: 0.6, edge: false });
  // arms hang at the sides
  c.capsule(17, 37, 4, 15, 48, 3.4, FUR, { texture: 0.5, seed: 23 });
  c.capsule(47, 37, 4, 49, 48, 3.4, FUR, { texture: 0.5, seed: 24 });
  // ears behind the head
  c.ellipse(21, 14, 7, 8, FUR, { texture: 0.4, seed: 25 });
  c.ellipse(43, 14, 7, 8, FUR, { texture: 0.4, seed: 26 });
  c.ellipse(21, 14, 3.6, 4.6, EAR, { flat: 0.5, bias: -1 });
  c.ellipse(43, 14, 3.6, 4.6, EAR, { flat: 0.5, bias: -1 });
  // back of the head
  c.ellipse(32, 26, 14, 12, FUR, { texture: 0.5, seed: 27 });
  c.outline();
}
