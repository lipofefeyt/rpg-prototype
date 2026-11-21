/**
 * Pixel-art drawing toolkit (no Phaser dependency, so sprites can be previewed in Node).
 *
 * Sprites are composed from lit, shaded shapes instead of flat rectangles:
 *   - every shape is shaded from a fixed top-left light with a colour ramp (dark -> light),
 *     quantised into bands, so all parts of a creature share one lighting model;
 *   - a shape that overlaps another gets a dark inner outline on its boundary, which gives the
 *     hand-inked look of separate limbs/ears/heads;
 *   - a final 1px outline surrounds the whole silhouette.
 *
 * Colours are 0xRRGGBB. A ramp lists tones from darkest to lightest (4-5 entries work well).
 */

export type Ramp = readonly number[];

/** Light direction (towards the light), normalised. Top-left and towards the viewer. */
const LX = -0.55, LY = -0.7, LZ = 0.45;
const LEN = Math.hypot(LX, LY, LZ);
const L = { x: LX / LEN, y: LY / LEN, z: LZ / LEN };

const BAYER = [0, 2, 3, 1]; // 2x2 ordered dither

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function mix(a: number, b: number, t: number): number {
  const r = ((a >> 16) & 255) + ((((b >> 16) & 255) - ((a >> 16) & 255)) * t);
  const g = ((a >> 8) & 255) + ((((b >> 8) & 255) - ((a >> 8) & 255)) * t);
  const bl = (a & 255) + (((b & 255) - (a & 255)) * t);
  return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(bl);
}

/** Builds a ramp of `n` tones from a dark and a light colour, with the base hue kept in the middle. */
export function ramp(dark: number, mid: number, light: number, n = 5): Ramp {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    out.push(t < 0.5 ? mix(dark, mid, t * 2) : mix(mid, light, (t - 0.5) * 2));
  }
  return out;
}

export interface ShapeOpts {
  /** Dither between shading bands (default true). */
  dither?: boolean;
  /** Dark inner outline where this shape overlaps what is already drawn (default true). */
  edge?: boolean;
  /** Random +-1 band jitter for fur/feather/rock texture, 0..1 (default 0). */
  texture?: number;
  /** Shift the light: positive brightens the whole shape by this many bands (default 0). */
  bias?: number;
  /** Flatten the shading (0 = full 3D, 1 = flat mid tone). Default 0. */
  flat?: number;
  /** Seed for the texture noise. */
  seed?: number;
}

function hash2(x: number, y: number, s: number): number {
  let h = Math.imul(x + 374761393, 0x27d4eb2d) ^ Math.imul(y + 668265263, 0x165667b1) ^ Math.imul(s + 1, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h ^= h >>> 13;
  return ((h >>> 0) % 1000) / 1000;
}

export class PixelCanvas {
  readonly w: number;
  readonly h: number;
  /** RGBA, straight alpha. */
  readonly data: Uint8ClampedArray<ArrayBuffer>;
  /** Id of the shape that last painted each pixel (0 = empty). */
  private readonly layer: Int32Array;
  private nextLayer = 1;
  /**
   * Drawing scale: sprites are authored in a 64x64 design space and rasterised at `k` times that
   * (k = 1.5 gives 96x96 pixels with finer detail). Every coordinate and radius is multiplied by k;
   * outlines, dithering and single pixels stay one canvas pixel wide.
   */
  readonly k: number;

  constructor(w = 64, h = 64, k = 1) {
    this.w = w; this.h = h; this.k = k;
    this.data = new Uint8ClampedArray(w * h * 4);
    this.layer = new Int32Array(w * h);
  }

  private set(x: number, y: number, color: number, id = 0): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    this.data[i] = (color >> 16) & 255; this.data[i + 1] = (color >> 8) & 255; this.data[i + 2] = color & 255; this.data[i + 3] = 255;
    this.layer[y * this.w + x] = id;
  }

  private get(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return -1;
    const i = (y * this.w + x) * 4;
    if (this.data[i + 3] === 0) return -1;
    return (this.data[i] << 16) | (this.data[i + 1] << 8) | this.data[i + 2];
  }

  /** Direct pixel (no shading). */
  px(x: number, y: number, color: number): this {
    const id = this.nextLayer++, n = Math.max(1, Math.round(this.k)), k = this.k;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) this.set(Math.round(x * k) + i, Math.round(y * k) + j, color, id);
    return this;
  }

  /** Flat filled rectangle. */
  rect(x: number, y: number, w: number, h: number, color: number): this {
    const id = this.nextLayer++, k = this.k;
    const x0 = Math.round(x * k), y0 = Math.round(y * k), x1 = Math.round((x + w) * k), y1 = Math.round((y + h) * k);
    for (let j = y0; j < Math.max(y1, y0 + 1); j++) for (let i = x0; i < Math.max(x1, x0 + 1); i++) this.set(i, j, color, id);
    return this;
  }

  /** Straight line of 1px (Bresenham). */
  line(x0: number, y0: number, x1: number, y1: number, color: number): this {
    const id = this.nextLayer++, k = this.k;
    x0 = Math.round(x0 * k); y0 = Math.round(y0 * k); x1 = Math.round(x1 * k); y1 = Math.round(y1 * k);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.set(x0, y0, color, id);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
    return this;
  }

  /**
   * Paints a pre-built coverage mask using a normal function. The core of every shape.
   * `normal(x, y)` returns (nx, ny, nz) of the surface at that pixel centre.
   */
  private paint(inside: Uint8Array, normal: (x: number, y: number) => [number, number, number], rampColors: Ramp, o: ShapeOpts): void {
    const id = this.nextLayer++;
    const n = rampColors.length;
    const painted: number[] = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (!inside[y * this.w + x]) continue;
      const [nx, ny, nz] = normal(x, y);
      const lam = nx * L.x + ny * L.y + nz * L.z;           // -1..1
      let t = clamp(lam * 0.5 + 0.55, 0, 0.999);             // 0..1, biased a little bright
      if (o.flat) t = t * (1 - o.flat) + 0.55 * o.flat;
      t += (o.bias ?? 0) / n;
      if (o.dither !== false) t += (BAYER[(y & 1) * 2 + (x & 1)] / 4 - 0.375) * (0.9 / n);
      if (o.texture) t += (hash2(x, y, o.seed ?? 0) - 0.5) * (o.texture * 1.6 / n);
      const band = clamp(Math.floor(t * n), 0, n - 1);
      this.set(x, y, rampColors[band], id);
      painted.push(y * this.w + x);
    }
    if (o.edge === false) return;
    // dark inner outline where this shape borders a *different, already drawn* shape
    const edgeColor = (c: number) => mix(c, 0x000000, 0.55);
    const toDark: [number, number][] = [];
    for (const idx of painted) {
      const x = idx % this.w, y = (idx / this.w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nxp = x + dx, nyp = y + dy;
        if (nxp < 0 || nyp < 0 || nxp >= this.w || nyp >= this.h) continue;
        const other = this.layer[nyp * this.w + nxp];
        if (other !== id && other !== 0) { toDark.push([x, y]); break; }
      }
    }
    for (const [x, y] of toDark) this.set(x, y, edgeColor(rampColors[0]), id);
  }

  /** Shaded ellipse (analytic sphere-like normals). */
  ellipse(cx: number, cy: number, rx: number, ry: number, r: Ramp, o: ShapeOpts = {}): this {
    cx *= this.k; cy *= this.k; rx *= this.k; ry *= this.k;
    const inside = new Uint8Array(this.w * this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
      if (nx * nx + ny * ny <= 1) inside[y * this.w + x] = 1;
    }
    this.paint(inside, (x, y) => {
      const nx = (x + 0.5 - cx) / rx, ny = (y + 0.5 - cy) / ry;
      return [nx, ny, Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))];
    }, r, o);
    return this;
  }

  /** Shaded capsule (round-ended limb / tail segment / horn) from (x0,y0, r0) to (x1,y1, r1). */
  capsule(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number, r: Ramp, o: ShapeOpts = {}): this {
    x0 *= this.k; y0 *= this.k; r0 *= this.k; x1 *= this.k; y1 *= this.k; r1 *= this.k;
    const inside = new Uint8Array(this.w * this.h);
    const dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy || 1;
    const at = (x: number, y: number) => {
      const t = clamp(((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / len2, 0, 1);
      const px = x0 + dx * t, py = y0 + dy * t, rad = r0 + (r1 - r0) * t;
      return { vx: x + 0.5 - px, vy: y + 0.5 - py, rad };
    };
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const { vx, vy, rad } = at(x, y);
      if (vx * vx + vy * vy <= rad * rad) inside[y * this.w + x] = 1;
    }
    this.paint(inside, (x, y) => {
      const { vx, vy, rad } = at(x, y);
      const nx = vx / rad, ny = vy / rad;
      return [nx, ny, Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))];
    }, r, o);
    return this;
  }

  /**
   * Shaded polygon (wings, ears, spikes, tails). Shading uses an inflated height field from the
   * distance to the outline, so flat shapes still read as rounded.
   */
  poly(points: [number, number][], r: Ramp, o: ShapeOpts & { puff?: number } = {}): this {
    points = points.map(([x, y]) => [x * this.k, y * this.k]);
    const inside = new Uint8Array(this.w * this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      const px = x + 0.5, py = y + 0.5;
      let c = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i], [xj, yj] = points[j];
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
      }
      if (c) inside[y * this.w + x] = 1;
    }
    // distance to outline (chamfer)
    const D = new Float32Array(this.w * this.h).fill(0);
    const big = 1e4;
    for (let i = 0; i < D.length; i++) D[i] = inside[i] ? big : 0;
    const at = (x: number, y: number) => (x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : D[y * this.w + x]);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (!inside[y * this.w + x]) continue;
      D[y * this.w + x] = Math.min(D[y * this.w + x], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.414, at(x + 1, y - 1) + 1.414);
    }
    for (let y = this.h - 1; y >= 0; y--) for (let x = this.w - 1; x >= 0; x--) {
      if (!inside[y * this.w + x]) continue;
      D[y * this.w + x] = Math.min(D[y * this.w + x], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.414, at(x - 1, y + 1) + 1.414);
    }
    let maxD = 1;
    for (const v of D) if (v < big && v > maxD) maxD = v;
    const puff = o.puff ?? 1;
    const h = (x: number, y: number) => Math.min(at(x, y), maxD) * puff;
    this.paint(inside, (x, y) => {
      const gx = (h(x + 1, y) - h(x - 1, y)) * 0.5, gy = (h(x, y + 1) - h(x, y - 1)) * 0.5;
      const nz = 1.2;
      const m = Math.hypot(gx, gy, nz);
      return [-gx / m, -gy / m, nz / m];
    }, r, o);
    return this;
  }

  /** Mirrors the current picture horizontally into the empty pixels (for symmetric front views). */
  mirrorFromLeft(axis = this.w / 2): this {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < axis; x++) {
      const mx = Math.round(2 * axis - 1 - x);
      if (mx < 0 || mx >= this.w) continue;
      const i = (y * this.w + x) * 4, j = (y * this.w + mx) * 4;
      if (this.data[i + 3] && !this.data[j + 3]) {
        this.data[j] = this.data[i]; this.data[j + 1] = this.data[i + 1]; this.data[j + 2] = this.data[i + 2]; this.data[j + 3] = 255;
        this.layer[y * this.w + mx] = this.layer[y * this.w + x];
      }
    }
    return this;
  }

  /** Mirrors the whole picture left-to-right (e.g. a profile that should face the other way). */
  flipX(): this {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w >> 1; x++) {
      const i = (y * this.w + x) * 4, j = (y * this.w + (this.w - 1 - x)) * 4;
      for (let k = 0; k < 4; k++) { const t = this.data[i + k]; this.data[i + k] = this.data[j + k]; this.data[j + k] = t; }
    }
    return this;
  }

  /** Remaps every opaque pixel's colour (used for palette-swapped variants of a creature). */
  recolor(fn: (r: number, g: number, b: number) => [number, number, number]): this {
    for (let i = 0; i < this.data.length; i += 4) {
      if (!this.data[i + 3]) continue;
      const [r, g, b] = fn(this.data[i], this.data[i + 1], this.data[i + 2]);
      this.data[i] = r; this.data[i + 1] = g; this.data[i + 2] = b;
    }
    return this;
  }

  /** Final 1px silhouette outline, tinted from the neighbouring colour (skips already-dark edges). */
  outline(strength = 0.62): this {
    const add: [number, number, number][] = [];
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (this.get(x, y) !== -1) continue;
      let best = -1;
      for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) {
        const c = this.get(x + dx, y + dy);
        if (c !== -1) { best = c; break; }
      }
      if (best === -1) continue;
      add.push([x, y, mix(best, 0x0a0812, strength)]);
    }
    for (const [x, y, c] of add) this.set(x, y, c, 0);
    return this;
  }
}
