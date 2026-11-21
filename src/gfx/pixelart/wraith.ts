import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// Wraith: a floating hooded spectre with tattered robes, bony hands and glowing poison-green eyes.
const ROBE = ramp(0x1c1c46, 0x5252a0, 0xb4b4f0);
const ROBE_D = ramp(0x10102c, 0x30306a, 0x6a6ab4, 4);
const HOOD_IN = ramp(0x020208, 0x08081a, 0x181838, 3);
const BONE = ramp(0x6a6a80, 0xc8c8dc, 0xfafaff, 4);
const EYE = ramp(0x2a8000, 0x90ff30, 0xf4ffd0, 3);
const WISP = ramp(0x3a3a80, 0x8888d8, 0xdcdcff, 3);

export function drawWraithFront(c: PixelCanvas): void {
  // tattered, tapering robe with wispy tails instead of legs
  c.poly([[14, 36], [50, 36], [58, 58], [50, 52], [47, 62], [41, 53], [36, 63], [32, 54], [28, 63], [23, 53], [17, 62], [14, 52], [6, 58]], ROBE_D, { texture: 0.35, seed: 2, puff: 0.5 });
  c.poly([[20, 34], [44, 34], [47, 54], [40, 50], [36, 58], [32, 51], [28, 58], [24, 50], [17, 54]], ROBE, { texture: 0.4, seed: 3, puff: 0.5 });
  // arms reaching forward with bony hands
  c.capsule(18, 38, 4.5, 11, 48, 3.5, ROBE, { texture: 0.35, seed: 4 });
  c.capsule(46, 38, 4.5, 53, 48, 3.5, ROBE, { texture: 0.35, seed: 5 });
  for (const [x, y, d] of [[10, 51, -1], [54, 51, 1]] as const) {
    c.ellipse(x, y, 3, 2.6, BONE, { edge: false });
    for (let f = -1; f <= 1; f++) c.capsule(x + d * 1.5 * f, y + 2, 0.9, x + d * 2.4 * f, y + 7, 0.7, BONE, { edge: false });
  }
  // hood and dark face void with glowing eyes
  c.poly([[20, 10], [32, 2], [44, 10], [46, 30], [32, 36], [18, 30]], ROBE, { texture: 0.35, seed: 6, puff: 0.7 });
  c.ellipse(32, 21, 9.5, 11, HOOD_IN, { flat: 0.2, edge: false });
  c.ellipse(28, 19, 2.8, 2, EYE, { edge: false, flat: 0.3 });
  c.ellipse(36, 19, 2.8, 2, EYE, { edge: false, flat: 0.3 });
  c.px(28, 19, 0x102000); c.px(36, 19, 0x102000);
  c.rect(28, 26, 8, 1.2, 0x2a2a50);
  // drifting wisps
  for (const [x, y] of [[6, 30], [58, 26], [10, 20], [55, 36]]) { c.ellipse(x, y, 2.4, 3.2, WISP, { edge: false, flat: 0.4 }); }
  c.outline();
}

export function drawWraithBack(c: PixelCanvas): void {
  c.poly([[14, 36], [50, 36], [58, 58], [50, 52], [47, 62], [41, 53], [36, 63], [32, 54], [28, 63], [23, 53], [17, 62], [14, 52], [6, 58]], ROBE_D, { texture: 0.35, seed: 12, puff: 0.5 });
  c.poly([[20, 34], [44, 34], [47, 54], [40, 50], [36, 58], [32, 51], [28, 58], [24, 50], [17, 54]], ROBE, { texture: 0.4, seed: 13, puff: 0.5 });
  c.capsule(17, 38, 4.5, 11, 48, 3.5, ROBE, { texture: 0.35, seed: 14 });
  c.capsule(47, 38, 4.5, 53, 48, 3.5, ROBE, { texture: 0.35, seed: 15 });
  c.poly([[20, 10], [32, 2], [44, 10], [46, 30], [32, 36], [18, 30]], ROBE, { texture: 0.4, seed: 16, puff: 0.7 });
  c.poly([[28, 12], [32, 8], [36, 12], [34, 30], [30, 30]], ROBE_D, { flat: 0.4, edge: false });
  for (const [x, y] of [[6, 30], [58, 26], [10, 20], [55, 36]]) { c.ellipse(x, y, 2.4, 3.2, WISP, { edge: false, flat: 0.4 }); }
  c.outline();
}
