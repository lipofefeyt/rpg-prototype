import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// Marsh Duck: a plump teal-and-cream duck with an orange bill and a tuft of reeds on its head.
const TEAL = ramp(0x143f55, 0x2a7f9a, 0x7cc8d8);
const TEAL_D = ramp(0x0f3248, 0x1f6682, 0x5aa8be);
const HEAD = ramp(0x145a44, 0x2a9470, 0x86e2b4);
const CREAM = ramp(0xa89a78, 0xeadfc0, 0xfffbec);
const BILL = ramp(0xa85a18, 0xf09a2c, 0xffd884, 4);
const FOOT = ramp(0xb0541a, 0xf08a28, 0xffc060, 4);
const REED = ramp(0x2c5a1c, 0x5fa23a, 0xa8e068, 4);
const SEED = ramp(0x4a2a14, 0x8a5a2a, 0xc89050, 4);
const DROP = ramp(0x3a7ab8, 0x7cc4ee, 0xe4f8ff, 3);

export function drawDuckFront(c: PixelCanvas): void {
  // webbed feet
  c.ellipse(24, 58.5, 6.5, 2.6, FOOT);
  c.ellipse(40, 58.5, 6.5, 2.6, FOOT);
  // tail tuft behind
  c.poly([[44, 50], [56, 44], [55, 55], [46, 57]], TEAL_D, { texture: 0.4, seed: 2 });
  // body, belly
  c.ellipse(32, 43, 19, 16, TEAL, { texture: 0.35, seed: 3 });
  c.ellipse(32, 48, 12, 10, CREAM, { texture: 0.25, seed: 4 });
  // folded wings at the sides
  c.ellipse(15.5, 43, 5.5, 11, TEAL_D, { texture: 0.45, seed: 5 });
  c.ellipse(48.5, 43, 5.5, 11, TEAL_D, { texture: 0.45, seed: 6 });
  c.ellipse(15, 49, 3.4, 4.6, ramp(0x2a6a8a, 0x3a8aaa, 0x9ad0e0, 4), { flat: 0.3 });
  c.ellipse(49, 49, 3.4, 4.6, ramp(0x2a6a8a, 0x3a8aaa, 0x9ad0e0, 4), { flat: 0.3 });
  // reeds on top of the head
  c.capsule(29, 14, 1, 26, 4, 0.8, REED, { edge: false });
  c.capsule(32, 13, 1, 32, 2, 0.8, REED, { edge: false });
  c.capsule(35, 14, 1, 38, 4, 0.8, REED, { edge: false });
  c.ellipse(32, 3.4, 1.4, 2.3, SEED, { edge: false });
  c.ellipse(26, 4.4, 1.2, 2, SEED, { edge: false });
  c.ellipse(38, 4.4, 1.2, 2, SEED, { edge: false });
  // white neck ring then head
  c.ellipse(32, 35.5, 10, 3.4, CREAM, { flat: 0.4 });
  c.ellipse(32, 24.5, 12, 11, HEAD, { texture: 0.3, seed: 7 });
  // bill
  c.ellipse(32, 31, 8, 4.2, BILL);
  c.ellipse(32, 29.2, 7, 2.6, ramp(0xb86a1c, 0xffb040, 0xffe098, 4), { edge: false, flat: 0.2 });
  c.px(29, 28, 0x8a4a10); c.px(34, 28, 0x8a4a10);
  // eyes
  c.ellipse(26.5, 23, 2.4, 2.9, ramp(0x000000, 0x14100c, 0x3a3030, 3), { edge: false, flat: 0.6 });
  c.ellipse(37.5, 23, 2.4, 2.9, ramp(0x000000, 0x14100c, 0x3a3030, 3), { edge: false, flat: 0.6 });
  c.px(25.5, 21.5, 0xffffff); c.px(36.5, 21.5, 0xffffff);
  // water drops
  c.ellipse(11, 19, 1.8, 2.4, DROP, { edge: false });
  c.ellipse(53, 26, 1.5, 2, DROP, { edge: false });
  c.ellipse(9, 30, 1.2, 1.6, DROP, { edge: false });
  c.outline();
}

export function drawDuckBack(c: PixelCanvas): void {
  c.ellipse(25, 59, 6.5, 2.4, FOOT);
  c.ellipse(39, 59, 6.5, 2.4, FOOT);
  // body from behind with folded wings and a tail
  c.ellipse(32, 44, 20, 16, TEAL, { texture: 0.4, seed: 11 });
  c.ellipse(32, 46, 13, 11, TEAL_D, { texture: 0.5, seed: 12, bias: 0.4 });
  c.ellipse(21, 45, 6, 11, TEAL_D, { texture: 0.45, seed: 13 });
  c.ellipse(43, 45, 6, 11, TEAL_D, { texture: 0.45, seed: 14 });
  c.ellipse(32, 55, 7, 3.6, ramp(0x0f3248, 0x2a7f9a, 0x9ad4e4, 4), { texture: 0.4, seed: 15 });
  c.ellipse(32, 33, 11, 3, CREAM, { flat: 0.4 });
  // reeds + back of head
  c.capsule(29, 14, 1, 26, 4, 0.8, REED, { edge: false });
  c.capsule(32, 13, 1, 32, 2, 0.8, REED, { edge: false });
  c.capsule(35, 14, 1, 38, 4, 0.8, REED, { edge: false });
  c.ellipse(32, 3.4, 1.4, 2.3, SEED, { edge: false });
  c.ellipse(26, 4.4, 1.2, 2, SEED, { edge: false });
  c.ellipse(38, 4.4, 1.2, 2, SEED, { edge: false });
  c.ellipse(32, 24, 12, 11, HEAD, { texture: 0.35, seed: 16 });
  c.outline();
}
