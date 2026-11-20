import type Phaser from "phaser";
import { SCREEN_K, SPRITE_SCALE } from "@/config";
import {
  TILE_SIZE, TILE_GRASS, TILE_TREE, TILE_PATH, TILE_WATER, TILE_TALLGRASS, TILE_CAVE_FLOOR,
} from "@/constants";

/**
 * Ground painter. The tilemap (tileset indices in data/zones.ts) stays the source of truth for
 * walking and encounters, but is no longer drawn: each zone's ground is painted once, at device
 * resolution (SCREEN_K x), from the same map data, then shown as a few big images. That allows
 * what a 16x16 repeating tileset can't do:
 *   - organic grass / dirt / stone from layered noise instead of identical tiles,
 *   - ragged, rounded borders where path, water and grass meet (plus a sandy shore and foam),
 *   - real trees (shadow, trunk, lit canopy with an outline) and rock walls in caves,
 *   - scattered tufts, flowers, pebbles and dense blades in tall grass.
 * Everything is deterministic (hashes of tile coordinates), so a zone looks the same each visit.
 */

const K = SCREEN_K;
const TP = TILE_SIZE * K;       // device pixels per tile
const CHUNK_TILES = 16;         // image chunks of 16x16 tiles keep every texture small
const NSIZE = 512;

// ── colour helpers (Uint32 pixels are little-endian ABGR) ─────────────────────

const px = (hex: number): number => (0xff000000 | ((hex & 0xff) << 16) | (hex & 0xff00) | ((hex >> 16) & 0xff)) >>> 0;
const R = (c: number) => c & 255, G = (c: number) => (c >> 8) & 255, B = (c: number) => (c >> 16) & 255;
const rgb = (r: number, g: number, b: number): number =>
  (0xff000000 | (Math.min(255, Math.max(0, b | 0)) << 16) | (Math.min(255, Math.max(0, g | 0)) << 8) | Math.min(255, Math.max(0, r | 0))) >>> 0;
const mul = (c: number, f: number): number => rgb(R(c) * f, G(c) * f, B(c) * f);
const mix = (a: number, b: number, t: number): number =>
  rgb(R(a) + (R(b) - R(a)) * t, G(a) + (G(b) - G(a)) * t, B(a) + (B(b) - B(a)) * t);

// ── noise ─────────────────────────────────────────────────────────────────────

let FINE: Uint8Array | null = null;
let COARSE: Uint8Array | null = null;

function makeNoise(seed: number, radius: number): Uint8Array {
  let s = seed | 0;
  const rnd = (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let a: Float32Array = new Float32Array(NSIZE * NSIZE);
  for (let i = 0; i < a.length; i++) a[i] = rnd();
  const blur = (src: Float32Array): Float32Array => {
    const tmp = new Float32Array(src.length), out = new Float32Array(src.length);
    const n = 2 * radius + 1;
    for (let y = 0; y < NSIZE; y++) for (let x = 0; x < NSIZE; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) sum += src[y * NSIZE + ((x + k) & (NSIZE - 1))];
      tmp[y * NSIZE + x] = sum / n;
    }
    for (let y = 0; y < NSIZE; y++) for (let x = 0; x < NSIZE; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) sum += tmp[((y + k) & (NSIZE - 1)) * NSIZE + x];
      out[y * NSIZE + x] = sum / n;
    }
    return out;
  };
  a = blur(blur(a));
  let lo = Infinity, hi = -Infinity;
  for (const v of a) { if (v < lo) lo = v; if (v > hi) hi = v; }
  const out = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = Math.round(((a[i] - lo) / (hi - lo)) * 255);
  return out;
}

const fine = (x: number, y: number): number => FINE![((y & (NSIZE - 1)) << 9) | (x & (NSIZE - 1))];
const coarse = (x: number, y: number): number => COARSE![(((y + 173) & (NSIZE - 1)) << 9) | ((x + 331) & (NSIZE - 1))];

function hash(a: number, b: number, c = 0): number {
  let h = Math.imul(a, 0x27d4eb2d) ^ Math.imul(b, 0x165667b1) ^ Math.imul(c, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

// ── palettes ──────────────────────────────────────────────────────────────────

const GRASS = [0x3b6a20, 0x477a28, 0x538a32, 0x62a03c, 0x7dc752].map(px);
const TALL = [0x2a5012, 0x34601a, 0x3f6f22, 0x4c8029].map(px);
const PATH = [0x9a7e52, 0xb09260, 0xc2a572, 0xd3b883].map(px);
const WATER = [0x164c78, 0x1a5e8e, 0x2273a5].map(px);
const CAVE = [0x1d1a29, 0x282334, 0x332e43, 0x3f3a51].map(px);
const ROCK = [0x4f4b5c, 0x5e5a6e, 0x6f6b80, 0x85819a].map(px);
const SAND = px(0xc9b98a), SAND_D = px(0xa8996d), FOAM = px(0xd3f0fb);
const PATH_LIP = px(0x8a7048);

type Cls = "grass" | "path" | "water" | "cave" | "wall";

function grassColor(c: number, f: number, tall: boolean): number {
  const v = c * 0.72 + f * 0.28;
  if (tall) return TALL[v < 85 ? 0 : v < 135 ? 1 : v < 185 ? 2 : 3];
  if (f > 244) return GRASS[4];
  return GRASS[v < 78 ? 0 : v < 130 ? 1 : v < 182 ? 2 : 3];
}
function pathColor(c: number, f: number): number {
  const v = c * 0.65 + f * 0.35;
  if (f < 10) return PATH[3];
  if (f > 246) return PATH[0];
  return PATH[v < 80 ? 0 : v < 140 ? 1 : v < 200 ? 2 : 3];
}
function waterColor(X: number, Y: number, c: number, f: number): number {
  if (f > 252) return px(0xcdeeff);
  const wave = f > 212 && ((Y + (X >> 3) + (c >> 5)) & 7) < 2;
  if (wave) return px(0x5aaed6);
  return WATER[c < 90 ? 0 : c < 175 ? 1 : 2];
}

// ── edge distance (device px from a pixel to the nearest "different" neighbour) ─

/** same[(dy+1)*3 + dx+1]: is the neighbouring tile in direction (dx,dy) the same class? */
function edgeDist(lx: number, ly: number, same: boolean[]): number {
  const s = (dx: number, dy: number) => same[(dy + 1) * 3 + dx + 1];
  let dx = 1e9, dy = 1e9;
  if (!s(-1, 0)) dx = Math.min(dx, lx + 0.5);
  if (!s(1, 0)) dx = Math.min(dx, TP - lx - 0.5);
  if (!s(0, -1)) dy = Math.min(dy, ly + 0.5);
  if (!s(0, 1)) dy = Math.min(dy, TP - ly - 0.5);
  let d = Math.min(dx, dy);
  const r = 5 * K; // outer corners are rounded with this radius
  if (dx < r && dy < r) d = r - Math.hypot(r - dx, r - dy);
  // inner corners: a differing diagonal neighbour whose two side neighbours are the same
  for (const sy of [-1, 1]) for (const sx of [-1, 1]) {
    if (s(sx, sy) || !s(sx, 0) || !s(0, sy)) continue;
    const cx = sx < 0 ? lx + 0.5 : TP - lx - 0.5;
    const cy = sy < 0 ? ly + 0.5 : TP - ly - 0.5;
    d = Math.min(d, Math.hypot(cx, cy));
  }
  return d;
}

// ── painting ──────────────────────────────────────────────────────────────────

function classOf(t: number, cave: boolean): Cls {
  if (t === TILE_PATH) return "path";
  if (t === TILE_WATER) return "water";
  if (t === TILE_CAVE_FLOOR) return "cave";
  if (t === TILE_TREE && cave) return "wall";
  return "grass";
}

function rect(buf: Uint32Array, W: number, H: number, x: number, y: number, w: number, h: number, color: number): void {
  for (let j = Math.max(0, y); j < Math.min(H, y + h); j++)
    for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) buf[j * W + i] = color;
}

function blade(buf: Uint32Array, W: number, H: number, x: number, baseY: number, h: number, w: number, lean: number, dark: number, mid: number, tip: number): void {
  for (let j = 0; j < h; j++) {
    const t = j / h;
    const col = t < 0.4 ? mix(dark, mid, t / 0.4) : mix(mid, tip, (t - 0.4) / 0.6);
    const xo = Math.round(x + lean * t * 3);
    const wj = j > h - 3 ? Math.max(1, w - 1) : w;
    rect(buf, W, H, xo, baseY - j, wj, 1, col);
  }
}

function stampTree(buf: Uint32Array, W: number, H: number, ox: number, oy: number, seed: number): void {
  // contact shadow: darken what is already there
  const scx = ox + TP * 0.52, scy = oy + TP * 0.88, srx = TP * 0.36, sry = TP * 0.11;
  for (let j = Math.floor(scy - sry); j <= Math.ceil(scy + sry); j++) for (let i = Math.floor(scx - srx); i <= Math.ceil(scx + srx); i++) {
    if (i < 0 || j < 0 || i >= W || j >= H) continue;
    const q = ((i - scx) / srx) ** 2 + ((j - scy) / sry) ** 2;
    if (q < 1) buf[j * W + i] = mul(buf[j * W + i], 0.62 + 0.3 * q);
  }
  // trunk
  const tx0 = Math.round(ox + TP * 0.43), tw = Math.round(TP * 0.15), ty0 = Math.round(oy + TP * 0.56), ty1 = Math.round(oy + TP * 0.92);
  for (let j = ty0; j < ty1; j++) for (let i = 0; i < tw; i++) {
    const c = i < tw * 0.3 ? px(0x8c5c30) : i > tw * 0.7 ? px(0x4a2d15) : px(0x6b4423);
    if (tx0 + i >= 0 && tx0 + i < W && j >= 0 && j < H) buf[j * W + tx0 + i] = c;
  }
  // canopy: union of three discs, shaded from the top-left, then outlined
  const pad = 4 * K, size = TP + pad * 2;
  const mask = new Uint8Array(size * size);
  const col = new Uint32Array(size * size);
  const discs: [number, number, number][] = [
    [TP * 0.5, TP * 0.38, TP * 0.4],
    [TP * 0.28, TP * 0.52, TP * 0.22],
    [TP * 0.72, TP * 0.5, TP * 0.23],
  ];
  const jitter = (hash(seed, 7) % 100) / 100;
  const L = [px(0x20531a), px(0x2f6e1c), px(0x3f8a26), px(0x5fae3a), px(0x86d05a)];
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const x = i - pad, y = j - pad;
    let hit = false;
    for (const [cx, cy, r] of discs) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) { hit = true; break; }
    if (!hit) continue;
    const [mx, my, mr] = discs[0];
    const t = ((x - mx) * -0.6 + (y - my) * -0.8) / mr + (jitter - 0.5) * 0.1; // -1 (shade) .. 1 (lit)
    let lvl = t > 0.55 ? 3 : t > 0.15 ? 2 : t > -0.3 ? 1 : 0;
    const f = fine(ox + x, oy + y);
    if (f > 214) lvl = Math.min(4, lvl + 1); else if (f < 38) lvl = Math.max(0, lvl - 1);
    mask[j * size + i] = 1;
    col[j * size + i] = L[lvl];
  }
  const ow = Math.max(2, Math.round(K * 0.8));
  const OUT = px(0x123610);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const idx = j * size + i;
    let c = 0;
    if (mask[idx]) {
      // inner dark rim on the shaded side
      const edge = (dx: number, dy: number) => { const a = i + dx, b = j + dy; return a < 0 || b < 0 || a >= size || b >= size || !mask[b * size + a]; };
      c = col[idx];
      if (edge(ow, ow) || edge(ow, 0) || edge(0, ow)) c = mul(c, 0.72);
    } else {
      let near = false;
      for (let dy = -ow; dy <= ow && !near; dy++) for (let dx = -ow; dx <= ow; dx++) {
        const a = i + dx, b = j + dy;
        if (dx * dx + dy * dy <= ow * ow + 1 && a >= 0 && b >= 0 && a < size && b < size && mask[b * size + a]) { near = true; break; }
      }
      if (near) c = OUT;
    }
    if (!c) continue;
    const X = ox + i - pad, Y = oy + j - pad;
    if (X >= 0 && Y >= 0 && X < W && Y < H) buf[Y * W + X] = c;
  }
}

/** Paints the whole zone into one Uint32 pixel buffer. */
function paintZone(map: number[][]): { buf: Uint32Array; W: number; H: number } {
  if (!FINE) FINE = makeNoise(0x1234abcd, Math.max(1, Math.round(K * 0.7)));
  if (!COARSE) COARSE = makeNoise(0x9e3779b9, Math.max(3, Math.round(K * 3.3)));
  const rows = map.length, cols = map[0].length;
  const W = cols * TP, H = rows * TP;
  const buf = new Uint32Array(W * H);
  const cave = map.some(row => row.includes(TILE_CAVE_FLOOR));
  const clsAt = (tx: number, ty: number, fallback: Cls): Cls =>
    tx < 0 || ty < 0 || tx >= cols || ty >= rows ? fallback : classOf(map[ty][tx], cave);

  // Pass 1: base colour for every pixel.
  for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
    const t = map[ty][tx];
    const cls = classOf(t, cave);
    const same: boolean[] = [];
    const sameTall: boolean[] = [];
    let edgy = false, edgyTall = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const s = clsAt(tx + dx, ty + dy, cls) === cls;
      same.push(s);
      if (!s) edgy = true;
      const nt = tx + dx < 0 || ty + dy < 0 || tx + dx >= cols || ty + dy >= rows ? t : map[ty + dy][tx + dx];
      const st = nt === TILE_TALLGRASS || classOf(nt, cave) !== "grass";
      sameTall.push(st);
      if (!st) edgyTall = true;
    }
    for (let ly = 0; ly < TP; ly++) {
      const Y = ty * TP + ly;
      for (let lx = 0; lx < TP; lx++) {
        const X = tx * TP + lx;
        const c = coarse(X, Y), f = fine(X, Y);
        let color: number;
        switch (cls) {
          case "grass": {
            if (t === TILE_TALLGRASS) {
              // tall grass: dark base, but ragged where it meets plain grass
              let plain = false;
              if (edgyTall) plain = edgeDist(lx, ly, sameTall) < K * 2 + (f / 255) * K * 3;
              color = grassColor(c, f, !plain);
            } else color = grassColor(c, f, false);
            break;
          }
          case "path": {
            if (!edgy) { color = pathColor(c, f); break; }
            const d = edgeDist(lx, ly, same);
            const cut = K * 0.3 + (f / 255) * K * 1.5;
            color = d < cut ? grassColor(c, f, false) : d < cut + K * 1.1 ? PATH_LIP : pathColor(c, f);
            break;
          }
          case "water": {
            if (!edgy) { color = waterColor(X, Y, c, f); break; }
            const d = edgeDist(lx, ly, same);
            const cut = K * 1.2 + (f / 255) * K * 2;
            color = d < cut ? (d < cut * 0.5 ? SAND : SAND_D) : d < cut + K * 1.4 ? FOAM : d < cut + K * 2.6 ? mix(waterColor(X, Y, c, f), FOAM, 0.35) : waterColor(X, Y, c, f);
            break;
          }
          case "cave": {
            color = CAVE[c < 85 ? 0 : c < 150 ? 1 : c < 205 ? 2 : 3];
            if (c >= 118 && c <= 124) color = px(0x120f1b); // winding cracks along a noise contour
            break;
          }
          default: { // cave wall / rock
            color = ROCK[c < 80 ? 0 : c < 150 ? 1 : c < 210 ? 2 : 3];
            if (edgy) {
              const d = edgeDist(lx, ly, same);
              if (d < K * 1.5) color = px(0x14101e);
              else if (d < K * 3.5) color = mix(color, px(0xaaa6bd), 0.25);
            }
          }
        }
        buf[Y * W + X] = color;
      }
    }
  }

  // Pass 2: decorations, back to front.
  const blades: { x: number; y: number; h: number; lean: number }[] = [];
  for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
    const t = map[ty][tx];
    const ox = tx * TP, oy = ty * TP;
    const h = hash(tx, ty);
    if (classOf(t, cave) === "grass" && t === TILE_GRASS) {
      // grass tufts
      const n = (h >> 2) & 3;
      for (let k = 0; k < n; k++) {
        const hh = hash(tx, ty, 11 + k);
        const x = ox + 5 * K + (hh % (TP - 10 * K)), y = oy + 6 * K + ((hh >> 9) % (TP - 8 * K));
        const ht = K * 3 + ((hh >> 18) & 3) * K;
        blade(buf, W, H, x - 2 * K, y, ht - K, 2, -1, px(0x3a6a1e), px(0x5f9a37), px(0x8fd860));
        blade(buf, W, H, x, y, ht, 2, 0, px(0x3a6a1e), px(0x62a038), px(0x9be466));
        blade(buf, W, H, x + 2 * K, y, ht - K, 2, 1, px(0x3a6a1e), px(0x5f9a37), px(0x8fd860));
      }
      // flowers
      if (((h >> 8) % 13) === 0) {
        const hh = hash(tx, ty, 99);
        const x = ox + 6 * K + (hh % (TP - 12 * K)), y = oy + 6 * K + ((hh >> 8) % (TP - 12 * K));
        const petal = [px(0xfff4d0), px(0xffe066), px(0xff9ec0), px(0xb8a0ff)][(hh >> 16) & 3];
        const s = Math.max(2, Math.round(K * 0.8));
        rect(buf, W, H, x - s, y, s, s, petal); rect(buf, W, H, x + s, y, s, s, petal);
        rect(buf, W, H, x, y - s, s, s, petal); rect(buf, W, H, x, y + s, s, s, petal);
        rect(buf, W, H, x, y, s, s, px(0xe8a020));
      }
    } else if (t === TILE_PATH) {
      const n = (h >> 3) % 3;
      for (let k = 0; k < n; k++) {
        const hh = hash(tx, ty, 31 + k);
        const x = ox + 8 * K + (hh % (TP - 16 * K)), y = oy + 8 * K + ((hh >> 9) % (TP - 16 * K));
        const rw = K + (hh >> 20) % K + 1, rh = Math.max(2, Math.round(rw * 0.65));
        rect(buf, W, H, x, y + 1, rw, rh, px(0x7b603c));       // shadow
        rect(buf, W, H, x, y, rw, rh, px(0x9a8260));            // stone
        rect(buf, W, H, x, y, rw, 1, px(0xcdb994));             // top light
      }
    } else if (t === TILE_TALLGRASS) {
      const n = 10;
      for (let k = 0; k < n; k++) {
        const hh = hash(tx, ty, 57 + k);
        blades.push({
          x: ox + 3 * K + (hh % (TP - 6 * K)),
          y: oy + Math.round(TP * 0.42) + ((hh >> 8) % Math.round(TP * 0.55)),
          h: K * 5 + ((hh >> 17) % (K * 4)),
          lean: ((hh >> 24) % 3) - 1,
        });
      }
    }
  }
  blades.sort((a, b) => a.y - b.y);
  for (const b of blades) blade(buf, W, H, b.x, b.y, b.h, 2, b.lean, px(0x1f4210), px(0x4a8a24), px(0x86d44e));

  // trees go on last, in row order, so lower trees overlap higher ones
  if (!cave) {
    for (let ty = 0; ty < rows; ty++) for (let tx = 0; tx < cols; tx++) {
      if (map[ty][tx] === TILE_TREE) stampTree(buf, W, H, tx * TP, ty * TP, hash(tx, ty));
    }
  }
  return { buf, W, H };
}

/**
 * Paints (once per zone, then cached as textures) and returns the images that show the zone's
 * ground, placed at the tile grid. Destroy the returned images when leaving the zone.
 */
export function createGroundImages(scene: Phaser.Scene, zoneId: string, map: number[][]): Phaser.GameObjects.Image[] {
  const rows = map.length, cols = map[0].length;
  const images: Phaser.GameObjects.Image[] = [];
  const cacheKey = (cx: number, cy: number) => `ground-${zoneId}-${cx}-${cy}`;
  const firstKey = cacheKey(0, 0);

  if (!scene.textures.exists(firstKey)) {
    const { buf, W, H } = paintZone(map);
    const chunkPx = CHUNK_TILES * TP;
    for (let cy = 0; cy * chunkPx < H; cy++) for (let cx = 0; cx * chunkPx < W; cx++) {
      const x0 = cx * chunkPx, y0 = cy * chunkPx;
      const w = Math.min(chunkPx, W - x0), h = Math.min(chunkPx, H - y0);
      const data = new Uint32Array(w * h);
      for (let j = 0; j < h; j++) data.set(buf.subarray((y0 + j) * W + x0, (y0 + j) * W + x0 + w), j * w);
      const tex = scene.textures.createCanvas(cacheKey(cx, cy), w, h);
      if (!tex) throw new Error(`groundArt: could not create ${cacheKey(cx, cy)}`);
      tex.getContext().putImageData(new ImageData(new Uint8ClampedArray(data.buffer), w, h), 0, 0);
      tex.refresh();
    }
  }
  for (let cy = 0; cy * CHUNK_TILES < rows; cy++) for (let cx = 0; cx * CHUNK_TILES < cols; cx++) {
    images.push(
      scene.add.image(cx * CHUNK_TILES * TILE_SIZE, cy * CHUNK_TILES * TILE_SIZE, cacheKey(cx, cy))
        .setOrigin(0, 0).setScale(SPRITE_SCALE).setDepth(-10),
    );
  }
  return images;
}
