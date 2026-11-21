import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// River Pike: a long olive-green predator fish in profile, with a toothy underbite and orange fins.
const SCALE = ramp(0x1a3a1c, 0x4a8a3a, 0xb0d870);
const BELLY = ramp(0x8a8a60, 0xdcd8a0, 0xfffcd8, 4);
const FIN = ramp(0x8a2c10, 0xe0642a, 0xffa860, 4);
const STRIPE = ramp(0x10240e, 0x2c5a24, 0x5a9a3a, 3);
const TOOTH = ramp(0xb0b0a0, 0xf0f0e0, 0xffffff, 3);

function pike(c: PixelCanvas): void {
  // tail fin and fins
  c.poly([[50, 34], [62, 22], [59, 36], [62, 50], [50, 38]], FIN, { puff: 0.9, texture: 0.2, seed: 2 });
  c.poly([[26, 28], [34, 16], [42, 24], [44, 31]], FIN, { puff: 0.9, texture: 0.2, seed: 3 });
  c.poly([[40, 42], [46, 52], [36, 46]], FIN, { puff: 0.8, edge: false });
  c.poly([[22, 40], [26, 52], [32, 44]], FIN, { puff: 0.8 });
  // long body
  c.ellipse(34, 36, 22, 10, SCALE, { texture: 0.35, seed: 4 });
  c.ellipse(32, 41, 18, 5, BELLY, { texture: 0.2, seed: 5, edge: false });
  // barred stripes
  for (let i = 0; i < 6; i++) c.poly([[24 + i * 4, 28], [27 + i * 4, 28], [28 + i * 4, 35], [25 + i * 4, 35]], STRIPE, { flat: 0.4, edge: false });
  // head and jaws pointing left
  c.ellipse(14, 35, 11, 8, SCALE, { texture: 0.3, seed: 6 });
  c.poly([[4, 36], [14, 38], [14, 43], [5, 42]], ramp(0x1a3a1c, 0x3a7a30, 0x8ac060, 4), { puff: 0.8 });
  c.rect(5, 39, 9, 1.4, 0x10240e);
  for (let i = 0; i < 4; i++) c.poly([[5.5 + i * 2.2, 39.4], [7 + i * 2.2, 39.4], [6.2 + i * 2.2, 42.4]], TOOTH, { edge: false, flat: 0.3 });
  // gill + eye
  c.line(20, 31, 21, 41, 0x244a20);
  c.ellipse(13, 31.5, 3, 3, ramp(0x7a5a00, 0xf0c020, 0xfff8b0, 3), { edge: false, flat: 0.3 });
  c.px(13, 31, 0x080400);
  c.outline();
}

export function drawPikeFront(c: PixelCanvas): void { pike(c); }
/** Faces right, towards the opponent, when it is the player's creature. */
export function drawPikeBack(c: PixelCanvas): void { pike(c); c.flipX(); }
