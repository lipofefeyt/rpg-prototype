import type Phaser from "phaser";
import { SCREEN_K } from "@/config";

/**
 * Sprite enhancement pass. The sprite art is drawn in code at 1 pixel per art pixel; this
 * re-rasterises a generated texture at SCREEN_K x (one texel per device pixel) and adds the
 * things flat rect art lacks, all at device-pixel thickness so they stay finer than the chunky
 * art pixels:
 *   - a thin dark outline around the silhouette (tinted from the edge colour, skipped where the
 *     art already has a dark edge),
 *   - a light rim on the top/left edges and a shadow rim on the bottom/right edges,
 *   - a gentle top-to-bottom light falloff.
 *
 * With upscaleOnly (hand-authored pixel art that already has its own lighting and outline) only
 * the SCREEN_K x upscale is done.
 *
 * The resulting texture replaces the original under the same key but is SCREEN_K x larger, so
 * every sprite created from it must be displayed at SPRITE_SCALE (see config.ts).
 */

const OUTLINE_PX = Math.max(1, Math.round(SCREEN_K * 0.67)); // outline thickness in texels
const RIM_PX = SCREEN_K;                                      // rim bevel width: one art pixel

/** Rec.601 luma of an RGB triple, 0..255. */
const luma = (r: number, g: number, b: number): number => 0.299 * r + 0.587 * g + 0.114 * b;

/**
 * Replaces texture `key` (a generateTexture() result) with an enhanced SCREEN_K x version.
 * For spritesheets pass the source cell size; frames are re-added with the same row-major
 * numbering and the cell size scaled up.
 */
export function enhanceTexture(scene: Phaser.Scene, key: string, cellW?: number, cellH?: number, upscaleOnly = false): void {
  const K = SCREEN_K;
  const tm = scene.textures;
  const src = tm.get(key).getSourceImage() as HTMLCanvasElement;
  const sw = src.width, sh = src.height;
  const sdata = src.getContext("2d")!.getImageData(0, 0, sw, sh).data;

  const W = sw * K, H = sh * K;
  const px = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    const sy = Math.floor(y / K);
    for (let x = 0; x < W; x++) {
      const si = (sy * sw + Math.floor(x / K)) * 4;
      const di = (y * W + x) * 4;
      px[di] = sdata[si]; px[di + 1] = sdata[si + 1]; px[di + 2] = sdata[si + 2]; px[di + 3] = sdata[si + 3];
    }
  }

  const cw = (cellW ?? sw) * K, ch = (cellH ?? sh) * K;
  if (!upscaleOnly) for (let cy = 0; cy < H; cy += ch) for (let cx = 0; cx < W; cx += cw) shadeCell(px, W, cx, cy, cw, ch);

  tm.remove(key);
  const tex = tm.createCanvas(key, W, H);
  if (!tex) throw new Error(`enhanceTexture: could not create ${key}`);
  tex.getContext().putImageData(new ImageData(px, W, H), 0, 0);
  tex.refresh();
  if (cellW !== undefined && cellH !== undefined) {
    const cols = Math.floor(sw / cellW), rows = Math.floor(sh / cellH);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tex.add(r * cols + c, 0, c * cw, r * ch, cw, ch);
  }
}

/** Outline + rim lighting for one cell of the (already upscaled) pixel buffer. */
function shadeCell(px: Uint8ClampedArray, stride: number, ox: number, oy: number, cw: number, ch: number): void {
  const idx = (x: number, y: number) => ((oy + y) * stride + (ox + x)) * 4;
  const opaque = new Uint8Array(cw * ch);
  let top = ch, bottom = -1;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    if (px[idx(x, y) + 3] > 127) { opaque[y * cw + x] = 1; if (y < top) top = y; if (y > bottom) bottom = y; }
  }
  if (bottom < 0) return; // empty cell
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < cw && y < ch && opaque[y * cw + x] === 1;

  // Pass 1: shade the sprite's own pixels (uses the original silhouette only).
  const span = Math.max(1, bottom - top);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    if (!opaque[y * cw + x]) continue;
    const i = idx(x, y);
    let r = px[i], g = px[i + 1], b = px[i + 2];

    // light falloff: up to +6% at the top, -12% at the bottom of the sprite
    const t = (y - top) / span;
    const k = 1.06 - 0.18 * t;
    r *= k; g *= k; b *= k;

    const lit = !solid(x - RIM_PX, y) || !solid(x, y - RIM_PX);
    const shaded = !solid(x + RIM_PX, y) || !solid(x, y + RIM_PX);
    if (lit && !shaded) { r += (255 - r) * 0.2; g += (255 - g) * 0.2; b += (255 - b) * 0.2; }
    else if (shaded && !lit) { r *= 0.74; g *= 0.74; b *= 0.74; }

    px[i] = r; px[i + 1] = g; px[i + 2] = b;
  }

  // Pass 2: outline - transparent pixels within OUTLINE_PX of the silhouette.
  const outline: { i: number; r: number; g: number; b: number }[] = [];
  const reach = OUTLINE_PX + 0.5;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    if (opaque[y * cw + x]) continue;
    let best = -1, bestD = Infinity;
    for (let dy = -OUTLINE_PX; dy <= OUTLINE_PX; dy++) {
      for (let dx = -OUTLINE_PX; dx <= OUTLINE_PX; dx++) {
        const d = dx * dx + dy * dy;
        if (d === 0 || d > reach * reach || d >= bestD || !solid(x + dx, y + dy)) continue;
        bestD = d; best = idx(x + dx, y + dy);
      }
    }
    if (best < 0) continue;
    const r = px[best], g = px[best + 1], b = px[best + 2];
    if (luma(r, g, b) < 70) continue; // the art already has a dark edge here
    outline.push({ i: idx(x, y), r: r * 0.3 + 6, g: g * 0.3 + 5, b: b * 0.3 + 16 });
  }
  for (const o of outline) { px[o.i] = o.r; px[o.i + 1] = o.g; px[o.i + 2] = o.b; px[o.i + 3] = 255; }
}
