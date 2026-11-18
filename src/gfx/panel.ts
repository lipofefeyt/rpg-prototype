import type Phaser from "phaser";

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
