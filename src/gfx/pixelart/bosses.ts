import { PixelCanvas, ramp } from "@/gfx/pixelDraw";

// ── Cavern Warden: a hulking crystal-studded stone guardian ───────────────────
const ROCK = ramp(0x1c1826, 0x5a5468, 0xb0a8c4);
const ROCK_D = ramp(0x14101c, 0x3e384e, 0x7a7290, 4);
const CRYS = ramp(0x3a1060, 0xb04ae0, 0xf8d0ff, 4);
const EYE = ramp(0x901008, 0xff3b30, 0xffc0b0, 3);

export function drawWardenFront(c: PixelCanvas): void {
  c.capsule(22, 50, 7.5, 21, 58, 6.5, ROCK_D, { texture: 0.7, seed: 2 });
  c.capsule(42, 50, 7.5, 43, 58, 6.5, ROCK_D, { texture: 0.7, seed: 3 });
  c.ellipse(20, 60, 9, 3, ROCK_D, { texture: 0.7, seed: 4 });
  c.ellipse(44, 60, 9, 3, ROCK_D, { texture: 0.7, seed: 5 });
  c.ellipse(32, 40, 19, 15, ROCK, { texture: 0.7, seed: 6 });
  c.capsule(11, 32, 8, 7, 49, 6.5, ROCK, { texture: 0.7, seed: 7 });
  c.capsule(53, 32, 8, 57, 49, 6.5, ROCK, { texture: 0.7, seed: 8 });
  c.ellipse(6, 54, 7, 6, ROCK_D, { texture: 0.7, seed: 9 });
  c.ellipse(58, 54, 7, 6, ROCK_D, { texture: 0.7, seed: 10 });
  c.ellipse(14, 29, 9, 7, ROCK, { texture: 0.7, seed: 11, bias: 0.3 });
  c.ellipse(50, 29, 9, 7, ROCK, { texture: 0.7, seed: 12, bias: 0.3 });
  // crystals on shoulders, crown and chest
  c.poly([[10, 26], [13, 10], [17, 26]], CRYS, { puff: 1.1 });
  c.poly([[46, 26], [51, 10], [54, 26]], CRYS, { puff: 1.1 });
  c.poly([[27, 14], [29, 2], [33, 14]], CRYS, { puff: 1.1 });
  c.poly([[31, 14], [36, 0], [40, 14]], CRYS, { puff: 1.1 });
  c.poly([[37, 14], [41, 5], [44, 15]], CRYS, { puff: 1.1 });
  c.ellipse(32, 24, 10, 9.5, ROCK, { texture: 0.6, seed: 13, bias: 0.2 });
  c.rect(24, 22, 16, 3, 0x0e0a14);
  c.ellipse(27.5, 23.5, 2.6, 1.7, EYE, { edge: false, flat: 0.3 });
  c.ellipse(36.5, 23.5, 2.6, 1.7, EYE, { edge: false, flat: 0.3 });
  c.poly([[28, 34], [32, 30], [36, 34], [36, 46], [32, 50], [28, 46]], CRYS, { puff: 1.2 });
  c.line(18, 34, 21, 44, 0x120e1a); c.line(46, 36, 43, 46, 0x120e1a);
  c.outline();
}

// ── Briarqueen: a leaf-gowned queen of thorns with a rose crown ───────────────
const LEAF = ramp(0x103a1a, 0x2c7a34, 0x84d070);
const LEAF_D = ramp(0x0a2410, 0x1a5022, 0x469a50, 4);
const BARK = ramp(0x2a1a0e, 0x6a4424, 0xb08048, 4);
const ROSE = ramp(0x5a0a1c, 0xc02848, 0xff8aa8, 4);
const SKIN_G = ramp(0x2a6a34, 0x6ab870, 0xc0f0b0, 4);

export function drawBriarqueenFront(c: PixelCanvas): void {
  // roots
  c.capsule(18, 56, 3, 8, 60, 2.2, BARK, { texture: 0.4, seed: 22 });
  c.capsule(46, 56, 3, 56, 60, 2.2, BARK, { texture: 0.4, seed: 23 });
  // layered leaf gown
  c.poly([[10, 58], [54, 58], [44, 34], [20, 34]], LEAF_D, { texture: 0.5, seed: 24, puff: 0.4 });
  c.poly([[14, 56], [50, 56], [42, 36], [22, 36]], LEAF, { texture: 0.5, seed: 25, puff: 0.5 });
  for (const [x, y] of [[18, 52], [26, 56], [34, 54], [42, 56], [48, 50], [22, 44], [38, 44], [30, 48]]) c.ellipse(x, y, 5, 3.4, LEAF_D, { texture: 0.5, seed: x + y });
  // vine arms with thorns
  c.capsule(18, 36, 3.4, 9, 52, 2.6, LEAF_D, { texture: 0.4, seed: 26 });
  c.capsule(46, 36, 3.4, 55, 52, 2.6, LEAF_D, { texture: 0.4, seed: 27 });
  for (const [x, y, dx] of [[13, 40, -5], [11, 46, -5], [51, 40, 5], [53, 46, 5]] as const) c.poly([[x, y - 1.6], [x + dx, y - 3], [x, y + 1.6]], BARK, { flat: 0.3, puff: 0.5 });
  c.capsule(9, 52, 2.6, 6, 59, 1.4, BARK, { edge: false }); c.capsule(55, 52, 2.6, 58, 59, 1.4, BARK, { edge: false });
  // vine hair, head
  c.capsule(21, 18, 2.6, 17, 38, 2, LEAF_D, { texture: 0.4, seed: 28 });
  c.capsule(43, 18, 2.6, 47, 38, 2, LEAF_D, { texture: 0.4, seed: 29 });
  c.ellipse(32, 24, 10.5, 11.5, SKIN_G, { texture: 0.15, seed: 30 });
  c.ellipse(27, 25, 2.5, 2.8, ramp(0xa07000, 0xffe04a, 0xffffff, 3), { edge: false, flat: 0.3 });
  c.ellipse(37, 25, 2.5, 2.8, ramp(0xa07000, 0xffe04a, 0xffffff, 3), { edge: false, flat: 0.3 });
  c.px(27, 25, 0x201000); c.px(37, 25, 0x201000);
  c.rect(29, 31, 6, 1.2, 0x3a1a2a);
  // crown of thorns and a big rose
  for (const [x0, x1, h] of [[22, 20, 9], [27, 26, 12], [37, 38, 12], [42, 44, 9]] as const) c.poly([[x0 - 1.5, 15], [x1, 15 - h], [x0 + 1.5, 15]], BARK, { flat: 0.3, puff: 0.6 });
  c.ellipse(32, 8.5, 8, 7.5, ROSE, { texture: 0.2, seed: 31 });
  c.ellipse(32, 8, 5.4, 5, ramp(0x7a1228, 0xe04868, 0xffb0c0, 4), { edge: true });
  c.ellipse(32, 8, 2.6, 2.4, ROSE, { edge: true });
  c.outline();
}

// ── Warlord Grukk: an orc warlord with horns, tusks, a breastplate and a great axe ─
const ORC = ramp(0x1c3a10, 0x4a7a2c, 0xa0d060);
const ORC_D = ramp(0x142a0c, 0x3a6020, 0x78a444, 4);
const STEEL = ramp(0x242a3a, 0x6a7488, 0xe0e8f4);
const STEEL_D = ramp(0x1a1e2a, 0x4a5266, 0x8892a8, 4);
const BONE = ramp(0x7a7258, 0xe0d8b8, 0xfffff0, 4);
const CLOTH = ramp(0x3a0c0c, 0x8a1c1c, 0xd05050, 4);

export function drawGrukkFront(c: PixelCanvas): void {
  // great axe behind the right arm
  c.capsule(58, 6, 1.9, 58, 60, 1.9, BROWN_AXE, { edge: false });
  c.poly([[46, 6], [58, 4], [60, 22], [50, 20], [47, 14]], STEEL, { puff: 0.8 });
  c.poly([[49, 8], [57, 7], [58, 16], [51, 15]], ramp(0x4a5266, 0x9ea8bc, 0xffffff, 4), { flat: 0.4, edge: false });
  // legs and boots
  c.capsule(25, 50, 5.4, 24, 57, 5, STEEL_D, { texture: 0.2, seed: 42 });
  c.capsule(39, 50, 5.4, 40, 57, 5, STEEL_D, { texture: 0.2, seed: 43 });
  c.ellipse(23, 59.5, 7.5, 3, ramp(0x10080a, 0x3a2418, 0x6a4a34, 3));
  c.ellipse(41, 59.5, 7.5, 3, ramp(0x10080a, 0x3a2418, 0x6a4a34, 3));
  // torso, breastplate, loincloth, belt
  c.ellipse(32, 40, 15.5, 13.5, ORC, { texture: 0.3, seed: 44 });
  c.poly([[20, 32], [44, 32], [42, 48], [32, 51], [22, 48]], STEEL, { texture: 0.15, seed: 45, puff: 0.5 });
  c.poly([[26, 48], [38, 48], [40, 58], [32, 56], [24, 58]], CLOTH, { texture: 0.3, seed: 46, puff: 0.4 });
  c.rect(22, 46, 20, 2.4, 0x2a1810); c.ellipse(32, 47.2, 2.8, 2.4, BONE, { edge: false });
  // arms, fists
  c.capsule(15, 36, 5.4, 11, 50, 4.8, ORC, { texture: 0.3, seed: 47 });
  c.capsule(49, 36, 5.4, 53, 50, 4.8, ORC, { texture: 0.3, seed: 48 });
  c.ellipse(11, 53, 5.2, 4.6, ORC_D, { texture: 0.3, seed: 49 });
  c.ellipse(53, 53, 5.2, 4.6, ORC_D, { texture: 0.3, seed: 50 });
  // spiked pauldrons
  c.ellipse(14, 31, 8, 6, STEEL, { texture: 0.15, seed: 51 });
  c.ellipse(50, 31, 8, 6, STEEL, { texture: 0.15, seed: 52 });
  c.poly([[10, 28], [9, 18], [15, 27]], BONE, { flat: 0.3, puff: 0.8 });
  c.poly([[54, 28], [55, 18], [49, 27]], BONE, { flat: 0.3, puff: 0.8 });
  // horned head with tusks
  c.poly([[20, 18], [14, 4], [26, 13]], BONE, { flat: 0.3, puff: 0.8 });
  c.poly([[44, 18], [50, 4], [38, 13]], BONE, { flat: 0.3, puff: 0.8 });
  c.ellipse(32, 24, 12.5, 11.5, ORC, { texture: 0.3, seed: 53 });
  c.poly([[20, 20], [44, 20], [42, 24], [22, 24]], ORC_D, { flat: 0.3, edge: false });
  c.ellipse(26.5, 24, 2.7, 2.1, ramp(0x700000, 0xff3030, 0xffa090, 3), { edge: false, flat: 0.3 });
  c.ellipse(37.5, 24, 2.7, 2.1, ramp(0x700000, 0xff3030, 0xffa090, 3), { edge: false, flat: 0.3 });
  c.px(27, 24, 0x100000); c.px(37, 24, 0x100000);
  c.rect(27, 30, 10, 2, 0x1a0808);
  c.poly([[26, 30], [24, 24.5], [29, 30.5]], BONE, { flat: 0.2, puff: 0.9 });
  c.poly([[38, 30], [40, 24.5], [35, 30.5]], BONE, { flat: 0.2, puff: 0.9 });
  c.outline();
}
const BROWN_AXE = ramp(0x2c1a10, 0x6a4020, 0xb07a40, 4);
