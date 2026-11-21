import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// Carrion Crow: a ragged blue-black crow with a bone-pale beak and amber eyes.
const FEATHER = ramp(0x06060e, 0x26263e, 0x7a7aa8);
const FEATHER_L = ramp(0x10101c, 0x363654, 0x8a8ab8, 4);
const BEAK = ramp(0x5a4a30, 0xc8b078, 0xf4e6b8, 4);
const CLAW = ramp(0x3a2a20, 0x8a6a48, 0xc8a070, 4);
const EYE = ramp(0x7a3a00, 0xffb020, 0xfff0a0, 3);

export function crowFrontBody(c: PixelCanvas): void {
  // claws
  c.capsule(26, 54, 1.6, 25, 60, 1.4, CLAW, { edge: false });
  c.capsule(38, 54, 1.6, 39, 60, 1.4, CLAW, { edge: false });
  c.line(21, 61, 29, 61, 0xc8a070); c.line(35, 61, 43, 61, 0xc8a070);
  // tail feathers
  c.poly([[26, 52], [22, 62], [29, 58], [32, 63], [35, 58], [42, 62], [38, 52]], FEATHER, { texture: 0.3, seed: 2 });
  // wings, ragged along the bottom edge
  c.poly([[21, 30], [6, 24], [1, 30], [4, 34], [1, 40], [6, 42], [4, 49], [11, 47], [13, 54], [19, 46], [22, 40]], FEATHER_L, { texture: 0.4, seed: 3, puff: 0.7 });
  c.poly([[43, 30], [58, 24], [63, 30], [60, 34], [63, 40], [58, 42], [60, 49], [53, 47], [51, 54], [45, 46], [42, 40]], FEATHER_L, { texture: 0.4, seed: 4, puff: 0.7 });
  // body and chest
  c.ellipse(32, 42, 14, 15, FEATHER, { texture: 0.5, seed: 5 });
  c.ellipse(32, 45, 8, 10, ramp(0x181828, 0x3a3a5a, 0x8c8cb8, 4), { texture: 0.5, seed: 6 });
  // head with shaggy neck feathers
  c.poly([[22, 30], [26, 36], [32, 33], [38, 36], [42, 30], [32, 26]], FEATHER, { texture: 0.5, seed: 7, puff: 0.6 });
  c.ellipse(32, 24, 10.5, 10, FEATHER, { texture: 0.4, seed: 8 });
  c.poly([[27, 14], [29, 7], [32, 13], [35, 6], [37, 14]], FEATHER, { texture: 0.3, seed: 9, puff: 0.6 });
  // beak
  c.poly([[27, 24], [37, 24], [32, 40]], BEAK, { puff: 0.9 });
  c.line(32, 28, 32, 37, 0x6a5a38);
  // eyes
  c.ellipse(26.5, 21.5, 2.4, 2.4, EYE, { edge: false, flat: 0.3 });
  c.ellipse(37.5, 21.5, 2.4, 2.4, EYE, { edge: false, flat: 0.3 });
  c.px(26, 21, 0x100800); c.px(37, 21, 0x100800);
}

export function drawCrowFront(c: PixelCanvas): void {
  crowFrontBody(c);
  c.outline();
}

export function crowBackBody(c: PixelCanvas): void {
  c.capsule(26, 54, 1.6, 25, 60, 1.4, CLAW, { edge: false });
  c.capsule(38, 54, 1.6, 39, 60, 1.4, CLAW, { edge: false });
  c.line(21, 61, 29, 61, 0xc8a070); c.line(35, 61, 43, 61, 0xc8a070);
  c.poly([[24, 50], [18, 63], [27, 58], [32, 64], [37, 58], [46, 63], [40, 50]], FEATHER, { texture: 0.3, seed: 12 });
  c.ellipse(32, 41, 15, 15, FEATHER, { texture: 0.5, seed: 13 });
  c.poly([[22, 28], [9, 30], [6, 44], [11, 52], [17, 46], [23, 40]], FEATHER_L, { texture: 0.4, seed: 14, puff: 0.7 });
  c.poly([[42, 28], [55, 30], [58, 44], [53, 52], [47, 46], [41, 40]], FEATHER_L, { texture: 0.4, seed: 15, puff: 0.7 });
  c.ellipse(32, 24, 10.5, 10, FEATHER, { texture: 0.4, seed: 16 });
  c.poly([[27, 14], [29, 6], [32, 13], [35, 5], [37, 14]], FEATHER, { texture: 0.3, seed: 17, puff: 0.6 });
}

export function drawCrowBack(c: PixelCanvas): void {
  crowBackBody(c);
  c.outline();
}

/** Dust Hawk: the crow's silhouette re-coloured tan and sandy, keeping the amber eyes. */
function tan(r: number, g: number, b: number): [number, number, number] {
  const sat = Math.max(r, g, b) - Math.min(r, g, b);
  if (sat > 110 && r > 200) return [r, g, b]; // eyes / bright accents stay
  const l = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
  const t = Math.min(1, l * 1.5);
  return [42 + t * 190, 28 + t * 156, 14 + t * 106];
}
export function drawHawkFront(c: PixelCanvas): void { crowFrontBody(c); c.recolor(tan); c.outline(); }
export function drawHawkBack(c: PixelCanvas): void { crowBackBody(c); c.recolor(tan); c.outline(); }
