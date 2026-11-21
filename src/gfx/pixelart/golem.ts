import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// Stone Golem: a hulking mossy rock figure with glowing orange eyes and cracks.
const STONE = ramp(0x24222a, 0x6a665e, 0xc0b8a6);
const STONE_D = ramp(0x1c1a22, 0x4e4a46, 0x8a8478, 4);
const MOSS = ramp(0x1a3a14, 0x3e7a2a, 0x88c458, 4);
const EYE = ramp(0xa02800, 0xff8a20, 0xfff0a0, 3);
const CRACK = 0x14121a;

export function drawGolemFront(c: PixelCanvas): void {
  // legs and feet
  c.capsule(25, 50, 6.5, 24, 57, 6, STONE_D, { texture: 0.7, seed: 2 });
  c.capsule(39, 50, 6.5, 40, 57, 6, STONE_D, { texture: 0.7, seed: 3 });
  c.ellipse(23, 59, 8, 3, STONE_D, { texture: 0.7, seed: 4 });
  c.ellipse(41, 59, 8, 3, STONE_D, { texture: 0.7, seed: 5 });
  // massive torso
  c.ellipse(32, 40, 18, 15, STONE, { texture: 0.7, seed: 6 });
  c.ellipse(26, 44, 7, 6, STONE, { texture: 0.7, seed: 7, bias: 0.4 });
  // arms with boulder fists
  c.capsule(14, 34, 7, 10, 48, 6, STONE, { texture: 0.7, seed: 8 });
  c.capsule(50, 34, 7, 54, 48, 6, STONE, { texture: 0.7, seed: 9 });
  c.ellipse(10, 52, 7.5, 6.5, STONE_D, { texture: 0.7, seed: 10 });
  c.ellipse(54, 52, 7.5, 6.5, STONE_D, { texture: 0.7, seed: 11 });
  // shoulders / rock shelf
  c.ellipse(16, 32, 8, 6, STONE, { texture: 0.7, seed: 12, bias: 0.3 });
  c.ellipse(48, 32, 8, 6, STONE, { texture: 0.7, seed: 13, bias: 0.3 });
  // moss patches
  c.ellipse(18, 29, 5, 2.6, MOSS, { texture: 0.6, seed: 14, edge: false });
  c.ellipse(45, 30, 5.6, 2.8, MOSS, { texture: 0.6, seed: 15, edge: false });
  c.ellipse(38, 52, 4, 2, MOSS, { texture: 0.6, seed: 16, edge: false });
  // small head set into the chest
  c.ellipse(32, 24, 9.5, 8.5, STONE, { texture: 0.6, seed: 17, bias: 0.2 });
  c.rect(24, 21.5, 16, 3, 0x14121a);
  c.ellipse(27.5, 23, 2.6, 1.6, EYE, { edge: false, flat: 0.4 });
  c.ellipse(36.5, 23, 2.6, 1.6, EYE, { edge: false, flat: 0.4 });
  // cracks
  c.line(30, 33, 34, 40, CRACK); c.line(34, 40, 31, 48, CRACK); c.line(40, 36, 44, 42, CRACK); c.line(20, 42, 24, 48, CRACK);
  c.outline();
}

export function drawGolemBack(c: PixelCanvas): void {
  c.capsule(25, 50, 6.5, 24, 57, 6, STONE_D, { texture: 0.7, seed: 22 });
  c.capsule(39, 50, 6.5, 40, 57, 6, STONE_D, { texture: 0.7, seed: 23 });
  c.ellipse(23, 59, 8, 3, STONE_D, { texture: 0.7, seed: 24 });
  c.ellipse(41, 59, 8, 3, STONE_D, { texture: 0.7, seed: 25 });
  c.ellipse(32, 40, 19, 16, STONE, { texture: 0.7, seed: 26 });
  c.ellipse(24, 38, 7, 8, STONE, { texture: 0.7, seed: 27, bias: 0.4 });
  c.capsule(13, 34, 7, 9, 48, 6, STONE, { texture: 0.7, seed: 28 });
  c.capsule(51, 34, 7, 55, 48, 6, STONE, { texture: 0.7, seed: 29 });
  c.ellipse(9, 52, 7.5, 6.5, STONE_D, { texture: 0.7, seed: 30 });
  c.ellipse(55, 52, 7.5, 6.5, STONE_D, { texture: 0.7, seed: 31 });
  c.ellipse(16, 32, 8, 6, STONE, { texture: 0.7, seed: 32, bias: 0.3 });
  c.ellipse(48, 32, 8, 6, STONE, { texture: 0.7, seed: 33, bias: 0.3 });
  c.ellipse(32, 30, 10, 3.4, MOSS, { texture: 0.6, seed: 34, edge: false });
  c.ellipse(32, 24, 9.5, 8.5, STONE, { texture: 0.6, seed: 35, bias: 0.2 });
  c.line(30, 33, 34, 42, CRACK); c.line(34, 42, 30, 50, CRACK); c.line(42, 36, 46, 44, CRACK);
  c.outline();
}
