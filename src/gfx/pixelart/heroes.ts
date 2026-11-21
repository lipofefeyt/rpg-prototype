import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

const SKIN = ramp(0x8a5a3c, 0xe8b890, 0xffe4c8, 4);
const SKIN_D = ramp(0x6a3e2a, 0xc08a64, 0xe8b890, 4);
const BROWN = ramp(0x2c1a10, 0x6a4020, 0xb07a40, 4);
const GOLD = ramp(0x8a5a10, 0xe0b030, 0xfff0a0, 4);

// ── Knight ────────────────────────────────────────────────────────────────────
const STEEL = ramp(0x2c3444, 0x7a8698, 0xe6edf8);
const STEEL_D = ramp(0x1c222e, 0x4a5466, 0x8a96aa, 4);
const TABARD = ramp(0x14285a, 0x2c5cb0, 0x78a8f0);
const PLUME = ramp(0x601010, 0xc23a2a, 0xff8a6a, 4);

export function drawKnightFront(c: PixelCanvas): void {
  // legs and boots
  c.capsule(26, 50, 4.6, 25, 57, 4.2, STEEL_D, { texture: 0.15, seed: 1 });
  c.capsule(38, 50, 4.6, 39, 57, 4.2, STEEL_D, { texture: 0.15, seed: 2 });
  c.ellipse(24, 59, 6.2, 2.8, BROWN);
  c.ellipse(40, 59, 6.2, 2.8, BROWN);
  // sword behind the right arm
  c.capsule(52, 12, 2.1, 52, 43, 1.7, STEEL, { flat: 0.3 });
  c.poly([[50, 12], [52, 6], [54, 12]], STEEL, { flat: 0.3 });
  c.rect(46.5, 43, 11, 2.6, 0xe0b030);
  c.capsule(52, 45, 1.5, 52, 52, 1.5, BROWN, { edge: false });
  c.ellipse(52, 53.5, 2.2, 2, GOLD);
  // torso (plate) and tabard
  c.ellipse(32, 40, 13.5, 12.5, STEEL, { texture: 0.2, seed: 3 });
  c.poly([[25, 33], [39, 33], [41, 53], [32, 56], [23, 53]], TABARD, { texture: 0.2, seed: 4, puff: 0.4 });
  c.rect(31, 36, 2, 11, 0xe0b030); c.rect(27, 40, 10, 2, 0xe0b030);
  c.rect(24, 47, 16, 2.2, 0x4a2c14); c.rect(30.5, 46.6, 3, 3, 0xe0b030);
  // arms with pauldrons
  c.capsule(19.5, 36, 5, 16.5, 47, 4, STEEL, { texture: 0.15, seed: 5 });
  c.capsule(44.5, 36, 5, 47.5, 47, 4, STEEL, { texture: 0.15, seed: 6 });
  c.ellipse(19, 34, 6.5, 5.2, STEEL, { bias: 0.4 });
  c.ellipse(45, 34, 6.5, 5.2, STEEL, { bias: 0.4 });
  c.ellipse(16, 49, 3.6, 3.4, STEEL_D);
  c.ellipse(48, 49, 3.6, 3.4, STEEL_D);
  // shield on the left arm
  c.poly([[3, 38], [17, 38], [17, 51], [10, 59], [3, 51]], STEEL_D, { texture: 0.15, seed: 7 });
  c.poly([[5.5, 40.5], [15, 40.5], [15, 50], [10, 56], [5.5, 50]], TABARD, { flat: 0.3, puff: 0.4 });
  c.rect(9, 41, 2, 14, 0xe0b030); c.rect(6, 45, 8, 2, 0xe0b030);
  // gorget and helmet
  c.ellipse(32, 31, 8.5, 3.6, STEEL_D);
  c.ellipse(32, 21.5, 11.5, 11.5, STEEL, { texture: 0.15, seed: 8 });
  c.rect(24.5, 21.5, 15, 2.6, 0x0a0a12);
  c.rect(31.2, 24, 1.6, 6, 0x2a3242);
  c.ellipse(23, 28, 3, 4, STEEL_D); c.ellipse(41, 28, 3, 4, STEEL_D);
  // plume
  c.poly([[32, 11], [36, 2], [44, 5], [41, 14], [34, 15]], PLUME, { puff: 0.9 });
  c.outline();
}

export function drawKnightBack(c: PixelCanvas): void {
  c.capsule(26, 50, 4.6, 25, 57, 4.2, STEEL_D, { texture: 0.15, seed: 11 });
  c.capsule(38, 50, 4.6, 39, 57, 4.2, STEEL_D, { texture: 0.15, seed: 12 });
  c.ellipse(24, 59, 6.2, 2.8, BROWN);
  c.ellipse(40, 59, 6.2, 2.8, BROWN);
  // cape
  c.poly([[21, 33], [43, 33], [48, 58], [32, 61], [16, 58]], TABARD, { texture: 0.25, seed: 13, puff: 0.5 });
  // round shield strapped to the back
  c.ellipse(32, 46, 9.5, 9.5, STEEL_D, { texture: 0.2, seed: 14 });
  c.ellipse(32, 46, 6.8, 6.8, TABARD, { flat: 0.4 });
  c.ellipse(32, 46, 2.4, 2.4, GOLD);
  // sword hilt over the shoulder
  c.capsule(44, 28, 1.6, 51, 15, 1.4, STEEL, { flat: 0.3, edge: false });
  c.rect(41, 28.5, 8, 2.4, 0xe0b030);
  // arms, pauldrons, head
  c.capsule(18.5, 36, 5, 15.5, 47, 4, STEEL, { texture: 0.15, seed: 15 });
  c.capsule(45.5, 36, 5, 48.5, 47, 4, STEEL, { texture: 0.15, seed: 16 });
  c.ellipse(18, 34, 6.5, 5.2, STEEL, { bias: 0.4 });
  c.ellipse(46, 34, 6.5, 5.2, STEEL, { bias: 0.4 });
  c.ellipse(32, 31, 8.5, 3.6, STEEL_D);
  c.poly([[32, 12], [37, 3], [45, 6], [41, 15], [33, 16]], PLUME, { puff: 0.9 });
  c.ellipse(32, 22, 11.5, 11.5, STEEL, { texture: 0.15, seed: 17 });
  c.rect(31, 13, 2, 17, 0x2a3242);
  c.outline();
}

// ── Mage ──────────────────────────────────────────────────────────────────────
const ROBE = ramp(0x501008, 0xb4301c, 0xf07850);
const ROBE_D = ramp(0x3a0a06, 0x8a2012, 0xd45a38, 4);
const FIRE = ramp(0xb02008, 0xff7a10, 0xfff4a8, 4);

export function drawMageFront(c: PixelCanvas): void {
  // staff with a fire orb, to the viewer's right
  c.capsule(51, 20, 1.6, 51, 60, 1.6, BROWN, { edge: false });
  c.ellipse(51, 14, 7.5, 7.5, ramp(0x7a1a08, 0xe05010, 0xffb040, 4), { flat: 0.6, edge: false });
  c.ellipse(51, 14, 5, 5, FIRE, { edge: false });
  c.px(49, 12, 0xffffff);
  // robe
  c.poly([[22, 34], [42, 34], [50, 60], [14, 60]], ROBE, { texture: 0.25, seed: 21, puff: 0.35 });
  c.rect(14, 56, 36, 3, 0xe0b030);
  c.poly([[28, 34], [36, 34], [34, 58], [30, 58]], ROBE_D, { flat: 0.2, edge: false, puff: 0.3 });
  c.rect(23, 46, 18, 2.4, 0x4a2c14);
  // sleeves and hands
  c.capsule(21, 37, 5, 15, 50, 4.4, ROBE, { texture: 0.2, seed: 22 });
  c.capsule(43, 37, 5, 50, 46, 4.4, ROBE, { texture: 0.2, seed: 23 });
  c.ellipse(14.5, 52, 3.4, 3.2, SKIN);
  c.ellipse(50.5, 47.5, 3.4, 3.2, SKIN);
  // head, beard, face
  c.ellipse(32, 28, 9.2, 9.6, SKIN, { texture: 0.1, seed: 24 });
  c.poly([[24, 30], [40, 30], [36, 42], [32, 45], [28, 42]], ramp(0x808088, 0xd0d0d8, 0xffffff, 4), { texture: 0.4, seed: 25, puff: 0.5 });
  c.rect(27.5, 25, 2.4, 2.8, 0x14100c); c.rect(34.1, 25, 2.4, 2.8, 0x14100c);
  c.px(28, 25, 0xffffff); c.px(34.6, 25, 0xffffff);
  c.line(27, 22.4, 30, 22.8, 0xe0e0e8); c.line(34, 22.8, 37, 22.4, 0xe0e0e8);
  // pointed hat with a bent tip and brim
  c.poly([[22, 24], [42, 24], [38, 10], [44, 5], [34, 2], [28, 12]], ROBE_D, { texture: 0.2, seed: 26, puff: 0.6 });
  c.ellipse(32, 24, 15.5, 3.6, ROBE, { bias: 0.2 });
  c.rect(23, 22.2, 18, 1.6, 0xe0b030);
  c.outline();
}

export function drawMageBack(c: PixelCanvas): void {
  c.capsule(52, 20, 1.6, 52, 60, 1.6, BROWN, { edge: false });
  c.ellipse(52, 14, 7.5, 7.5, ramp(0x7a1a08, 0xe05010, 0xffb040, 4), { flat: 0.6, edge: false });
  c.ellipse(52, 14, 5, 5, FIRE, { edge: false });
  c.poly([[21, 34], [43, 34], [51, 60], [13, 60]], ROBE, { texture: 0.3, seed: 31, puff: 0.35 });
  c.rect(13, 56, 38, 3, 0xe0b030);
  c.poly([[27, 36], [37, 36], [39, 56], [25, 56]], ROBE_D, { flat: 0.3, edge: false, puff: 0.3 });
  c.capsule(20, 37, 5, 14, 49, 4.4, ROBE, { texture: 0.2, seed: 32 });
  c.capsule(44, 37, 5, 50, 46, 4.4, ROBE, { texture: 0.2, seed: 33 });
  c.ellipse(32, 28, 9.2, 9.6, ramp(0x2a1a10, 0x5a3a24, 0x8a6240, 4), { texture: 0.4, seed: 34 });
  c.poly([[22, 24], [42, 24], [38, 10], [44, 5], [34, 2], [28, 12]], ROBE_D, { texture: 0.2, seed: 35, puff: 0.6 });
  c.ellipse(32, 24, 15.5, 3.6, ROBE, { bias: 0.2 });
  c.rect(23, 22.2, 18, 1.6, 0xe0b030);
  c.outline();
}

// ── Ranger ────────────────────────────────────────────────────────────────────
const CLOAK = ramp(0x142e18, 0x347a38, 0x84c868);
const CLOAK_D = ramp(0x0c1c10, 0x1e4a24, 0x4a8a42, 4);
const LEATHER = ramp(0x2a1a0e, 0x6a4424, 0xb88048, 4);

export function drawRangerFront(c: PixelCanvas): void {
  // bow (viewer's left): arc made of capsules, string as a line
  c.capsule(15, 14, 1.5, 11, 24, 1.5, LEATHER, { edge: false });
  c.capsule(11, 24, 1.5, 11, 38, 1.5, LEATHER, { edge: false });
  c.capsule(11, 38, 1.5, 15, 50, 1.5, LEATHER, { edge: false });
  c.line(15, 14, 15, 50, 0xe8e0cc);
  // legs, boots
  c.capsule(27, 50, 4, 26, 57, 3.6, LEATHER, { texture: 0.2, seed: 41 });
  c.capsule(37, 50, 4, 38, 57, 3.6, LEATHER, { texture: 0.2, seed: 42 });
  c.ellipse(25, 59, 5.8, 2.6, BROWN);
  c.ellipse(39, 59, 5.8, 2.6, BROWN);
  // cloak + tunic
  c.poly([[22, 33], [42, 33], [46, 57], [32, 59], [18, 57]], CLOAK, { texture: 0.35, seed: 43, puff: 0.45 });
  c.poly([[28, 34], [36, 34], [36, 50], [28, 50]], ramp(0x4a3010, 0x8a6030, 0xc89858, 4), { flat: 0.3, edge: false });
  c.rect(26, 47, 12, 2.2, 0x4a2c14); c.rect(31, 46.8, 2.4, 2.6, 0xc8c8d0);
  // arms: one holds the bow
  c.capsule(20, 36, 4.4, 15, 46, 3.6, CLOAK, { texture: 0.3, seed: 44 });
  c.capsule(44, 36, 4.4, 47, 47, 3.6, CLOAK, { texture: 0.3, seed: 45 });
  c.ellipse(14.5, 47.5, 3.2, 3, SKIN);
  c.ellipse(47.5, 48.5, 3.2, 3, SKIN);
  // quiver feathers over the shoulder
  c.capsule(46, 30, 2.4, 50, 18, 2.2, LEATHER, { edge: false });
  c.px(49, 14, 0xe0e8f0); c.px(51, 15, 0xe0e8f0); c.px(48, 16, 0xe05040);
  // hood with a shadowed face
  c.ellipse(32, 24, 12.5, 12.2, CLOAK, { texture: 0.35, seed: 46 });
  c.ellipse(32, 27, 7.6, 7.2, ramp(0x1a1410, 0x3a2a20, 0x6a4c38, 3), { flat: 0.2, edge: false });
  c.ellipse(32, 29, 6, 5.4, SKIN_D, { flat: 0.1, edge: false });
  c.rect(28.6, 27, 2.2, 2.2, 0x0c0a08); c.rect(33.4, 27, 2.2, 2.2, 0x0c0a08);
  c.px(29, 27, 0xffffff); c.px(33.8, 27, 0xffffff);
  c.poly([[26, 14], [32, 6], [38, 14]], CLOAK_D, { puff: 0.6 });
  c.outline();
}

export function drawRangerBack(c: PixelCanvas): void {
  c.capsule(14, 14, 1.5, 10, 24, 1.5, LEATHER, { edge: false });
  c.capsule(10, 24, 1.5, 10, 38, 1.5, LEATHER, { edge: false });
  c.capsule(10, 38, 1.5, 14, 50, 1.5, LEATHER, { edge: false });
  c.capsule(27, 50, 4, 26, 57, 3.6, LEATHER, { texture: 0.2, seed: 51 });
  c.capsule(37, 50, 4, 38, 57, 3.6, LEATHER, { texture: 0.2, seed: 52 });
  c.ellipse(25, 59, 5.8, 2.6, BROWN);
  c.ellipse(39, 59, 5.8, 2.6, BROWN);
  c.poly([[21, 33], [43, 33], [47, 58], [32, 60], [17, 58]], CLOAK, { texture: 0.4, seed: 53, puff: 0.45 });
  // quiver on the back
  c.capsule(37, 30, 3, 40, 50, 2.6, LEATHER, { texture: 0.2, seed: 54 });
  c.px(35, 28, 0xe0e8f0); c.px(37, 27, 0xe05040); c.px(39, 28, 0xe0e8f0); c.px(41, 27, 0xe0e8f0);
  c.capsule(19, 36, 4.4, 14, 46, 3.6, CLOAK, { texture: 0.3, seed: 55 });
  c.capsule(45, 36, 4.4, 49, 47, 3.6, CLOAK, { texture: 0.3, seed: 56 });
  c.ellipse(32, 24, 12.5, 12.2, CLOAK, { texture: 0.4, seed: 57 });
  c.poly([[26, 14], [32, 5], [38, 14]], CLOAK_D, { puff: 0.6 });
  c.outline();
}
