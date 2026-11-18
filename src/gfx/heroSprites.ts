import Phaser from "phaser";

/**
 * Hero battle sprites (front + back, 64x64) for the three playable classes, drawn
 * procedurally with Phaser Graphics like the creature sprites. Registered under the
 * species ids 7 (Knight), 4 (Mage) and 1 (Ranger).
 */

type G = Phaser.GameObjects.Graphics;
type DrawFn = (g: G) => void;

/** Rect helpers: R = absolute, C = horizontally centred on x=32. */
function helpers(g: G) {
  const R = (c: number, x: number, y: number, w: number, h: number) => { g.fillStyle(c); g.fillRect(x, y, w, h); };
  const C = (c: number, y: number, w: number, h: number) => R(c, 32 - w / 2, y, w, h);
  return { R, C };
}

const SKIN = 0xf0c8a0, SKIN_D = 0xc9a07a, EYE = 0x1a1a1a, OUTLINE = 0x20202c;

// ── Knight ───────────────────────────────────────────────────────────────────

const STEEL = 0xb8c0cc, STEEL_D = 0x7a8494, STEEL_L = 0xdde3ec;
const TABARD = 0x2f5fb0, TABARD_D = 0x21458a, PLUME = 0xc0392b, GOLD = 0xe0b030;

function drawKnightFront(g: G): void {
  const { R, C } = helpers(g);
  // shadow
  C(OUTLINE, 58, 30, 2);
  // plume + helmet
  C(PLUME, 7, 6, 3); C(PLUME, 10, 8, 2);
  C(STEEL_D, 12, 18, 14); C(STEEL, 12, 16, 12); C(STEEL_L, 13, 4, 6);
  C(OUTLINE, 20, 12, 3);            // visor slit
  C(STEEL_D, 24, 14, 3);
  // torso
  C(STEEL_D, 27, 24, 17); C(TABARD, 28, 20, 15); C(TABARD_D, 40, 20, 3);
  C(GOLD, 31, 4, 8); R(GOLD, 28, 34, 8, 3);   // cross on tabard
  // belt
  C(0x5a3a1e, 42, 22, 2); C(GOLD, 42, 4, 2);
  // arms
  R(STEEL_D, 14, 28, 6, 14); R(STEEL, 15, 28, 4, 12);
  R(STEEL_D, 44, 28, 6, 14); R(STEEL, 45, 28, 4, 12);
  // sword (right of viewer)
  R(STEEL_L, 51, 10, 3, 30); R(STEEL, 53, 10, 1, 30);
  R(GOLD, 48, 40, 9, 3); R(0x5a3a1e, 52, 43, 2, 6);
  // shield (left of viewer)
  R(STEEL_D, 6, 28, 16, 20); R(TABARD, 8, 30, 12, 16); R(GOLD, 13, 32, 2, 12); R(GOLD, 9, 37, 10, 2);
  // legs + boots
  R(STEEL_D, 23, 45, 7, 10); R(STEEL_D, 34, 45, 7, 10);
  R(0x3a2a1a, 21, 55, 10, 4); R(0x3a2a1a, 33, 55, 10, 4);
}

function drawKnightBack(g: G): void {
  const { R, C } = helpers(g);
  C(OUTLINE, 60, 32, 2);
  C(PLUME, 8, 8, 4); C(PLUME, 12, 6, 5);
  C(STEEL_D, 14, 20, 16); C(STEEL, 14, 18, 14); C(STEEL_L, 15, 4, 5);
  C(STEEL_D, 30, 14, 3);
  // cloak/tabard back
  C(STEEL_D, 33, 28, 24); C(TABARD, 34, 24, 22); C(TABARD_D, 50, 24, 6);
  C(GOLD, 38, 4, 12);
  // arms
  R(STEEL_D, 12, 34, 7, 14); R(STEEL, 13, 34, 5, 12);
  R(STEEL_D, 45, 34, 7, 14); R(STEEL, 46, 34, 5, 12);
  // shield on back
  C(STEEL_D, 38, 14, 12); C(0x5a3a1e, 40, 10, 8);
  // legs
  R(STEEL_D, 22, 56, 8, 5); R(STEEL_D, 34, 56, 8, 5);
  R(0x3a2a1a, 20, 60, 11, 3); R(0x3a2a1a, 33, 60, 11, 3);
}

// ── Mage ─────────────────────────────────────────────────────────────────────

const ROBE = 0xb8331f, ROBE_D = 0x8a2214, ROBE_L = 0xd9573b, HAT = 0x6a1a14;

function drawMageFront(g: G): void {
  const { R, C } = helpers(g);
  C(OUTLINE, 58, 30, 2);
  // pointed hat
  C(HAT, 3, 4, 3); C(HAT, 6, 8, 3); C(HAT, 9, 12, 3); C(HAT, 12, 16, 3);
  C(HAT, 15, 28, 3); C(GOLD, 14, 16, 1);
  // face
  C(SKIN, 18, 14, 9); C(SKIN_D, 25, 14, 2);
  R(EYE, 26, 21, 2, 2); R(EYE, 36, 21, 2, 2);
  C(0xdddddd, 26, 8, 3); // beard
  // robe
  C(ROBE_D, 28, 26, 28); C(ROBE, 28, 24, 26); C(ROBE_L, 29, 4, 22);
  C(ROBE_D, 52, 30, 5);
  C(GOLD, 38, 24, 2); // sash
  // arms / sleeves
  R(ROBE_D, 10, 30, 8, 14); R(ROBE, 11, 30, 6, 12); R(SKIN, 11, 43, 6, 3);
  R(ROBE_D, 46, 30, 8, 14); R(ROBE, 47, 30, 6, 12); R(SKIN, 47, 43, 6, 3);
  // staff + flame orb (viewer's right)
  R(0x6a4a2a, 54, 16, 2, 42);
  R(0xff8a1a, 51, 8, 8, 8); R(0xffd23a, 53, 10, 4, 4); R(0xfff3b0, 54, 11, 2, 2);
  R(0xff8a1a, 54, 4, 2, 4);
  // feet
  R(0x3a2a1a, 22, 57, 8, 3); R(0x3a2a1a, 34, 57, 8, 3);
}

function drawMageBack(g: G): void {
  const { R, C } = helpers(g);
  C(OUTLINE, 60, 32, 2);
  C(HAT, 4, 4, 3); C(HAT, 7, 8, 3); C(HAT, 10, 12, 3); C(HAT, 13, 16, 3);
  C(HAT, 16, 28, 3); C(GOLD, 15, 16, 1);
  C(0xdddddd, 19, 14, 8);                 // hair
  C(ROBE_D, 27, 28, 32); C(ROBE, 28, 26, 30); C(ROBE_L, 29, 4, 26);
  C(ROBE_D, 54, 32, 5);
  R(ROBE_D, 10, 32, 8, 14); R(ROBE, 11, 32, 6, 12);
  R(ROBE_D, 46, 32, 8, 14); R(ROBE, 47, 32, 6, 12);
  R(0x6a4a2a, 54, 18, 2, 42);
  R(0xff8a1a, 51, 10, 8, 8); R(0xffd23a, 53, 12, 4, 4);
  R(0x3a2a1a, 22, 59, 8, 3); R(0x3a2a1a, 34, 59, 8, 3);
}

// ── Ranger ───────────────────────────────────────────────────────────────────

const CLOAK = 0x3d7a3d, CLOAK_D = 0x2a5a2a, CLOAK_L = 0x5aa05a, LEATHER = 0x7a5232, WOOD = 0x8a5a2a;

function drawRangerFront(g: G): void {
  const { R, C } = helpers(g);
  C(OUTLINE, 58, 30, 2);
  // hood
  C(CLOAK_D, 8, 18, 3); C(CLOAK_D, 11, 22, 3); C(CLOAK, 12, 20, 14); C(CLOAK_L, 13, 6, 3);
  // face in hood
  C(SKIN, 16, 12, 10); C(SKIN_D, 24, 12, 2);
  R(EYE, 27, 20, 2, 2); R(EYE, 35, 20, 2, 2);
  // cloak
  C(CLOAK_D, 27, 28, 26); C(CLOAK, 28, 24, 24); C(CLOAK_L, 29, 4, 18);
  C(CLOAK_D, 48, 30, 5);
  // tunic + belt
  C(LEATHER, 32, 12, 14); C(0x4a3018, 40, 14, 2); C(GOLD, 40, 3, 2);
  // quiver strap + arrows peeking
  R(0x4a3018, 40, 24, 2, 18);
  R(0xdddddd, 44, 18, 1, 5); R(0xdddddd, 47, 18, 1, 5); R(PLUME, 44, 16, 1, 2); R(PLUME, 47, 16, 1, 2);
  // arms
  R(CLOAK_D, 12, 30, 7, 13); R(SKIN, 12, 42, 6, 3);
  R(CLOAK_D, 45, 30, 7, 13); R(SKIN, 46, 42, 6, 3);
  // bow (viewer's left)
  R(WOOD, 6, 14, 2, 4); R(WOOD, 4, 18, 2, 24); R(WOOD, 6, 42, 2, 4);
  R(0xe8e0c8, 8, 16, 1, 28);
  // legs / boots
  R(CLOAK_D, 24, 48, 6, 8); R(CLOAK_D, 34, 48, 6, 8);
  R(0x3a2a1a, 22, 56, 9, 4); R(0x3a2a1a, 33, 56, 9, 4);
}

function drawRangerBack(g: G): void {
  const { R, C } = helpers(g);
  C(OUTLINE, 60, 32, 2);
  C(CLOAK_D, 10, 18, 3); C(CLOAK_D, 13, 22, 3); C(CLOAK, 14, 20, 14); C(CLOAK_L, 15, 6, 3);
  C(CLOAK_D, 29, 28, 28); C(CLOAK, 30, 24, 26); C(CLOAK_L, 31, 4, 20);
  C(CLOAK_D, 52, 30, 5);
  // quiver on back
  R(LEATHER, 38, 28, 8, 20); R(0x4a3018, 38, 28, 8, 2);
  R(0xdddddd, 39, 24, 1, 5); R(0xdddddd, 42, 23, 1, 6); R(0xdddddd, 45, 24, 1, 5);
  R(PLUME, 39, 22, 1, 2); R(PLUME, 42, 21, 1, 2); R(PLUME, 45, 22, 1, 2);
  R(CLOAK_D, 12, 32, 7, 13); R(CLOAK_D, 45, 32, 7, 13);
  R(WOOD, 4, 20, 2, 24);
  R(0x3a2a1a, 22, 58, 9, 4); R(0x3a2a1a, 33, 58, 9, 4);
}

export const HERO_DRAWERS: Record<number, { front: DrawFn; back: DrawFn }> = {
  7: { front: drawKnightFront, back: drawKnightBack },
  4: { front: drawMageFront,   back: drawMageBack },
  1: { front: drawRangerFront, back: drawRangerBack },
};
