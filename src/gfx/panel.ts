import type Phaser from "phaser";
import { SCREEN_K } from "@/config";

/**
 * Panels with chamfered corners, drawn from plain rectangles only.
 *
 * Phaser's fillRoundedRect/strokeRoundedRect tessellate arcs into triangles, and on the
 * Android WebView's emulated GPU that produced visible dark triangular artifacts across
 * panels (confirmed on the emulator; clean in desktop Chromium). fillRect is rendered
 * correctly everywhere, so every panel in the game goes through these two helpers.
 *
 * Colour and alpha come from the Graphics' current fillStyle - set it before each call.
 * The fill is made of non-overlapping rects, so translucent fills never double-blend.
 */

/** Fills the panel body with the corners cut by [n] px. */
export function fillPanel(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, n: number): void {
  n = Math.min(Math.max(0, Math.round(n)), Math.floor(Math.min(w, h) / 2));
  if (n === 0) { g.fillRect(x, y, w, h); return; }
  g.fillRect(x + n, y, w - 2 * n, h);          // centre column, full height
  g.fillRect(x, y + n, n, h - 2 * n);          // left strip between the cut corners
  g.fillRect(x + w - n, y + n, n, h - 2 * n);  // right strip
}

/** Draws a [t]-px outline following the same chamfered shape as fillPanel. */
export function strokePanel(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, n: number, t = 1): void {
  n = Math.min(Math.max(0, Math.round(n)), Math.floor(Math.min(w, h) / 2));
  g.fillRect(x + n, y, w - 2 * n, t);              // top
  g.fillRect(x + n, y + h - t, w - 2 * n, t);      // bottom
  g.fillRect(x, y + n, t, h - 2 * n);              // left
  g.fillRect(x + w - t, y + n, t, h - 2 * n);      // right
  // stair-stepped diagonals across each cut corner
  for (let i = 0; i < n; i++) {
    g.fillRect(x + n - 1 - i, y + i, t, t);                    // top-left
    g.fillRect(x + w - n + i, y + i, t, t);                    // top-right
    g.fillRect(x + n - 1 - i, y + h - 1 - i, t, t);            // bottom-left
    g.fillRect(x + w - n + i, y + h - 1 - i, t, t);            // bottom-right
  }
}

/** Corner cut in px for a former rounded-rect radius (chamfers read rounder than they are). */
export const cut = (radius: number): number => Math.max(1, Math.round(radius * 0.5));

// ── Bevelled panels and bars ───────────────────────────────────────────────────

const HAIR = 1 / SCREEN_K; // one device pixel, in logical units: fine highlight/shadow lines

const channel = (c: number, shift: number) => (c >> shift) & 255;
const pack = (r: number, g: number, b: number) =>
  (Math.min(255, Math.max(0, Math.round(r))) << 16) | (Math.min(255, Math.max(0, Math.round(g))) << 8) | Math.min(255, Math.max(0, Math.round(b)));
/** Moves a colour toward white (t > 0) or black (t < 0). */
export function shadeColor(c: number, t: number): number {
  const target = t >= 0 ? 255 : 0, k = Math.abs(t);
  return pack(channel(c, 16) + (target - channel(c, 16)) * k, channel(c, 8) + (target - channel(c, 8)) * k, channel(c, 0) + (target - channel(c, 0)) * k);
}

export interface PanelStyle {
  /** Chamfer in px (default 2). */
  cut?: number;
  fill?: number;
  fillAlpha?: number;
  border?: number;
  borderWidth?: number;
  /** Drop shadow under the panel (default true). */
  shadow?: boolean;
}

/**
 * A layered panel: soft drop shadow, body with a lit upper half and a darker lower half, a coloured
 * border, and device-pixel-thin highlight (top/left) and shade (bottom/right) lines just inside it.
 * Only fillRect underneath (see the note at the top of this file).
 */
export function drawPanel(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, s: PanelStyle = {}): void {
  const n = s.cut ?? 2;
  const fill = s.fill ?? 0x0d1a2e, alpha = s.fillAlpha ?? 0.92;
  const border = s.border ?? 0x2a4a9a, bw = s.borderWidth ?? 2;

  if (s.shadow !== false) { g.fillStyle(0x000000, 0.32); fillPanel(g, x + 1.5, y + 2.5, w, h, n); }
  g.fillStyle(fill, alpha);                     fillPanel(g, x, y, w, h, n);
  // soft light from above / shade below: a few bands that fade out (never a hard-edged slab),
  // kept inside the border so they never touch the chamfers
  const ix = x + bw + n, iw = w - (bw + n) * 2, ih = h - bw * 2;
  const bandH = Math.min(ih * 0.4, 22), steps = 6;
  for (let i = 0; i < steps; i++) {
    const t = 1 - i / steps;
    g.fillStyle(0xffffff, 0.075 * t);
    g.fillRect(ix, y + bw + (bandH * i) / steps, iw, bandH / steps + 0.01);
    g.fillStyle(0x000000, 0.22 * t);
    g.fillRect(ix, y + h - bw - (bandH * (i + 1)) / steps, iw, bandH / steps + 0.01);
  }
  g.fillStyle(border, 1);                       strokePanel(g, x, y, w, h, n, bw);
  // fine inner lines
  g.fillStyle(shadeColor(border, 0.45), 0.9); g.fillRect(x + bw + n, y + bw, w - (bw + n) * 2, HAIR * 1.5);
  g.fillRect(x + bw, y + bw + n, HAIR * 1.5, h - (bw + n) * 2);
  g.fillStyle(shadeColor(border, -0.5), 0.9); g.fillRect(x + bw + n, y + h - bw - HAIR * 1.5, w - (bw + n) * 2, HAIR * 1.5);
  g.fillRect(x + w - bw - HAIR * 1.5, y + bw + n, HAIR * 1.5, h - (bw + n) * 2);
}

/**
 * A segmented HP bar: dark inset track, a fill with a bright top band and darker bottom band, and
 * tick marks every 10%. Clears and redraws `g` each call (cheap), so call it whenever HP changes.
 */
export function drawHpBar(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, frac: number, color: number): void {
  g.clear();
  g.fillStyle(0x05060c, 1);  g.fillRect(x - 1.5, y - 1.5, w + 3, h + 3);   // outer border
  g.fillStyle(0x1c2236, 1);  g.fillRect(x, y, w, h);                        // track
  g.fillStyle(0x000000, 0.35); g.fillRect(x, y, w, HAIR * 2);               // inset shadow
  const fw = Math.max(0, Math.floor(w * Math.min(1, Math.max(0, frac)) * SCREEN_K) / SCREEN_K);
  if (fw > 0) {
    g.fillStyle(shadeColor(color, -0.12), 1); g.fillRect(x, y, fw, h);
    g.fillStyle(shadeColor(color, 0.42), 1);  g.fillRect(x, y, fw, h * 0.38);   // bright top band
    g.fillStyle(shadeColor(color, -0.38), 1); g.fillRect(x, y + h * 0.78, fw, h * 0.22); // dark bottom
  }
  g.fillStyle(0x05060c, 0.55);
  for (let i = 1; i < 10; i++) g.fillRect(x + (w * i) / 10 - HAIR, y, HAIR * 2, h);
}
