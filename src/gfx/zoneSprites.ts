import Phaser from "phaser";

/**
 * Sprites for the Deep Forest and Eastern Plains: two new monsters (Dire Wolf, Tusked
 * Boar), two bosses (Briarqueen, Warlord Grukk), and a recolor helper used to derive
 * variant species from existing art. All 64x64, drawn with Phaser Graphics rects.
 */

type G = Phaser.GameObjects.Graphics;
export type DrawFn = (g: G) => void;

function helpers(g: G) {
  const R = (c: number, x: number, y: number, w: number, h: number) => { g.fillStyle(c); g.fillRect(x, y, w, h); };
  const C = (c: number, y: number, w: number, h: number) => R(c, 32 - w / 2, y, w, h);
  return { R, C };
}

// ── Recolor helper ──────────────────────────────────────────────────────────

function rgbToHsl(c: number): [number, number, number] {
  const r = ((c >> 16) & 255) / 255, g = ((c >> 8) & 255) / 255, b = (c & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb(h: number, s: number, l: number): number {
  const f = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
  };
  if (s === 0) { const v = Math.round(l * 255); return (v << 16) | (v << 8) | v; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  return (Math.round(f(p, q, h + 1 / 3) * 255) << 16) | (Math.round(f(p, q, h) * 255) << 8) | Math.round(f(p, q, h - 1 / 3) * 255);
}

/**
 * Re-draws [fn] with every color moved to [hue] (0-1), keeping lightness; saturation is
 * scaled by [sat]. Near-greys (outlines, eyes, highlights) are left alone.
 */
export function recolor(fn: DrawFn, hue: number, sat = 1): DrawFn {
  const remap = (c: number) => {
    const [, s, l] = rgbToHsl(c);
    if (s < 0.12 || l < 0.1 || l > 0.9) return c;
    return hslToRgb(hue, Math.min(1, s * sat), l);
  };
  return (g: G) => {
    const proxy: G = new Proxy(g, {
      get(target, key) {
        const v = (target as unknown as Record<string | symbol, unknown>)[key];
        if (key === "fillStyle") return (c: number, a?: number) => { target.fillStyle(remap(c), a); return proxy; };
        if (key === "lineStyle") return (w: number, c: number, a?: number) => { target.lineStyle(w, remap(c), a); return proxy; };
        return typeof v === "function" ? (v as (...args: unknown[]) => unknown).bind(target) : v;
      },
    });
    fn(proxy);
  };
}

// ── Dire Wolf ───────────────────────────────────────────────────────────────

const FUR = 0x6e6a78, FUR_D = 0x4a4654, FUR_L = 0x8f8a9c, BELLY = 0xb9b4c4;
const WEYE = 0xffd23a, DARK = 0x1a1a1a, FANG = 0xf4f4f4;

export function drawWolfFront(g: G): void {
  const { R, C } = helpers(g);
  C(0x2a2634, 59, 34, 2);
  // tail (right)
  R(FUR_D, 50, 40, 8, 5); R(FUR_D, 55, 30, 5, 12);
  // haunches + legs
  R(FUR, 12, 42, 10, 14); R(FUR, 42, 42, 10, 14);
  R(FUR_D, 17, 44, 8, 15); R(FUR_D, 39, 44, 8, 15);
  R(FUR_L, 16, 58, 10, 3); R(FUR_L, 38, 58, 10, 3);
  // body + chest ruff
  C(FUR, 38, 30, 14); C(FUR_D, 48, 26, 4);
  C(BELLY, 34, 12, 14); C(FUR_L, 34, 6, 3);
  // head
  R(FUR_D, 17, 6, 6, 10); R(FUR_D, 41, 6, 6, 10);       // ears
  R(0xc98a8a, 19, 9, 2, 5); R(0xc98a8a, 43, 9, 2, 5);
  C(FUR, 13, 24, 16); C(FUR_L, 14, 6, 3);
  C(FUR_L, 24, 14, 11);                                // muzzle
  R(WEYE, 23, 18, 5, 3); R(WEYE, 36, 18, 5, 3);
  R(DARK, 25, 19, 2, 2); R(DARK, 37, 19, 2, 2);
  R(DARK, 30, 24, 4, 3);                               // nose
  C(DARK, 31, 10, 1);
  R(FANG, 26, 32, 2, 4); R(FANG, 36, 32, 2, 4);
  R(0xd84a5a, 30, 32, 4, 3);
}

export function drawWolfBack(g: G): void {
  const { R, C } = helpers(g);
  C(0x2a2634, 60, 34, 2);
  R(FUR_D, 17, 6, 6, 10); R(FUR_D, 41, 6, 6, 10);
  C(FUR, 12, 24, 16); C(FUR_D, 14, 14, 4);
  C(FUR, 27, 32, 22); C(FUR_D, 30, 4, 20);              // back + spine
  C(FUR_L, 28, 10, 3);
  // tail hanging down the middle
  C(FUR_D, 40, 8, 14); C(FUR, 42, 4, 10);
  R(FUR_D, 14, 46, 10, 12); R(FUR_D, 40, 46, 10, 12);
  R(FUR_L, 13, 57, 12, 3); R(FUR_L, 39, 57, 12, 3);
}

// ── Tusked Boar ─────────────────────────────────────────────────────────────

const HIDE = 0x8a5a3a, HIDE_D = 0x6a4028, HIDE_L = 0xa87850, SNOUT = 0xd9a0a0, TUSK = 0xf4efd8, MANE = 0x4a2a18;

export function drawBoarFront(g: G): void {
  const { R, C } = helpers(g);
  C(0x2a2634, 59, 40, 2);
  // body
  C(HIDE_D, 34, 46, 22); C(HIDE, 35, 42, 18); C(HIDE_L, 36, 12, 3);
  C(MANE, 30, 22, 5);                                   // bristle ridge peeking above
  // legs + hooves
  R(HIDE_D, 14, 50, 9, 9); R(HIDE_D, 41, 50, 9, 9);
  R(0x2a1a10, 13, 58, 11, 3); R(0x2a1a10, 40, 58, 11, 3);
  // head
  R(HIDE_D, 16, 13, 7, 8); R(HIDE_D, 41, 13, 7, 8);     // ears
  C(HIDE, 17, 28, 18); C(HIDE_L, 18, 8, 3);
  C(SNOUT, 28, 16, 10); C(0xb07878, 35, 16, 3);
  R(DARK, 27, 31, 3, 3); R(DARK, 34, 31, 3, 3);          // nostrils
  R(0xff5a3a, 22, 22, 3, 3); R(0xff5a3a, 39, 22, 3, 3);  // eyes
  R(DARK, 23, 23, 1, 1); R(DARK, 40, 23, 1, 1);
  R(TUSK, 19, 33, 4, 8); R(TUSK, 41, 33, 4, 8);          // tusks
  R(TUSK, 17, 31, 3, 4); R(TUSK, 44, 31, 3, 4);
}

export function drawBoarBack(g: G): void {
  const { R, C } = helpers(g);
  C(0x2a2634, 60, 40, 2);
  R(HIDE_D, 16, 13, 7, 8); R(HIDE_D, 41, 13, 7, 8);
  C(HIDE, 17, 26, 16); C(MANE, 18, 10, 6);
  C(HIDE_D, 30, 46, 26); C(HIDE, 31, 42, 22); C(MANE, 30, 8, 18);
  C(HIDE_L, 36, 10, 3);
  R(HIDE_D, 30, 46, 4, 2);
  C(HIDE_D, 48, 3, 6);                                  // little tail
  R(HIDE_D, 15, 54, 9, 6); R(HIDE_D, 40, 54, 9, 6);
  R(0x2a1a10, 14, 59, 11, 3); R(0x2a1a10, 39, 59, 11, 3);
}

// ── Briarqueen (boss) ───────────────────────────────────────────────────────

const LEAF = 0x3f8a46, LEAF_D = 0x2a5a30, LEAF_L = 0x6ab86a, BARK = 0x5a3a22, ROSE = 0xd23a5a, ROSE_L = 0xff7a8a;

export function drawBriarqueenFront(g: G): void {
  const { R, C } = helpers(g);
  // root base
  C(BARK, 56, 40, 6); C(0x3a2414, 59, 46, 3);
  R(BARK, 8, 54, 8, 5); R(BARK, 48, 54, 8, 5);
  // layered leaf gown
  C(LEAF_D, 30, 26, 6); C(LEAF, 31, 24, 6);
  C(LEAF_D, 36, 32, 6); C(LEAF, 37, 30, 6);
  C(LEAF_D, 42, 38, 6); C(LEAF, 43, 36, 6);
  C(LEAF_D, 48, 44, 8); C(LEAF, 49, 42, 7);
  for (const x of [14, 22, 30, 38, 46]) R(LEAF_L, x, 50 + (x % 3), 3, 2);
  C(LEAF_L, 33, 6, 2);
  // thorn vine arms
  R(LEAF_D, 10, 26, 6, 24); R(LEAF_D, 48, 26, 6, 24);
  R(BARK, 8, 30, 3, 3); R(BARK, 8, 38, 3, 3); R(BARK, 53, 32, 3, 3); R(BARK, 53, 40, 3, 3);
  R(LEAF_L, 11, 27, 2, 8); R(LEAF_L, 49, 27, 2, 8);
  R(BARK, 8, 49, 3, 6); R(BARK, 12, 50, 3, 6); R(BARK, 49, 49, 3, 6); R(BARK, 53, 50, 3, 6);  // claws
  // vine hair
  R(LEAF_D, 20, 12, 5, 22); R(LEAF_D, 39, 12, 5, 22);
  // head
  C(LEAF_L, 11, 14, 14); C(0x8ad88a, 12, 6, 3);
  R(0xffe04a, 26, 17, 3, 3); R(0xffe04a, 35, 17, 3, 3);
  R(DARK, 27, 18, 1, 2); R(DARK, 36, 18, 1, 2);
  C(0x2a1a2a, 23, 6, 1);
  // crown of thorns + rose
  R(BARK, 22, 7, 2, 6); R(BARK, 40, 7, 2, 6); R(BARK, 27, 5, 2, 6); R(BARK, 35, 5, 2, 6);
  C(ROSE, 1, 10, 7); C(ROSE_L, 2, 4, 3); C(0x8a1a3a, 6, 6, 3);
  // glowing core
  C(ROSE, 38, 4, 4); C(ROSE_L, 39, 2, 2);
}

// ── Warlord Grukk (boss) ────────────────────────────────────────────────────

const SKIN = 0x7a8a4a, SKIN_D = 0x566332, BONE = 0xe8e0c0, STEEL = 0x7a7a8c, STEEL_D = 0x505062, STEEL_L = 0xa8a8bc, CLOTH = 0xa8322a;

export function drawGrukkFront(g: G): void {
  const { R, C } = helpers(g);
  // legs + boots
  R(STEEL_D, 18, 46, 12, 12); R(STEEL_D, 34, 46, 12, 12);
  R(0x2a1a10, 16, 57, 15, 5); R(0x2a1a10, 33, 57, 15, 5);
  // torso, breastplate and belt
  C(SKIN_D, 22, 30, 26); C(STEEL, 24, 26, 18); C(STEEL_L, 25, 8, 3); C(STEEL_D, 38, 26, 5);
  C(CLOTH, 42, 28, 4); R(BONE, 29, 42, 6, 4);
  // arms + fists
  R(SKIN_D, 4, 28, 12, 22); R(SKIN, 5, 28, 9, 20);
  R(SKIN_D, 48, 28, 12, 22); R(SKIN, 49, 28, 9, 20);
  R(SKIN_D, 3, 48, 13, 9); R(SKIN_D, 48, 48, 13, 9);
  // pauldrons + spikes
  R(STEEL_D, 4, 20, 18, 12); R(STEEL, 5, 21, 16, 9); R(STEEL_L, 6, 22, 6, 3);
  R(STEEL_D, 42, 20, 18, 12); R(STEEL, 43, 21, 16, 9); R(STEEL_L, 44, 22, 6, 3);
  R(BONE, 8, 15, 3, 6); R(BONE, 52, 15, 3, 6);
  // head, horns, tusks
  C(SKIN, 6, 18, 17); C(SKIN_D, 18, 18, 5);
  R(BONE, 15, 2, 4, 10); R(BONE, 45, 2, 4, 10); R(BONE, 13, 0, 3, 4); R(BONE, 48, 0, 3, 4);
  R(SKIN_D, 20, 11, 24, 3);                              // heavy brow
  R(0xff3030, 24, 14, 5, 3); R(0xff3030, 35, 14, 5, 3);
  R(DARK, 26, 15, 1, 2); R(DARK, 37, 15, 1, 2);
  R(BONE, 25, 20, 3, 6); R(BONE, 36, 20, 3, 6);
  C(DARK, 21, 12, 2);
  // great axe (viewer's right)
  R(0x6a4a2a, 57, 8, 3, 52);
  R(STEEL_D, 50, 6, 14, 14); R(STEEL, 51, 7, 12, 11); R(STEEL_L, 52, 8, 4, 4);
}
