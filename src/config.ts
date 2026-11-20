import type Phaser from "phaser";

/**
 * Display + test-build configuration.
 *
 * Display: the game keeps a fixed logical height and derives its logical width from the
 * window's aspect ratio so tall phone screens (Galaxy S25: 2340x1080 landscape) are filled
 * instead of letterboxed. Scenes that were composed for the classic 480x320 frame (battle,
 * menu, starter pick) are centred inside the wider canvas with centerFixedLayout().
 *
 * Test knobs: VITE_* variables, set in .env.s25.local (see .env.example) or the shell, are
 * baked in at build time. Every default reproduces the shipped behaviour.
 */

/** Minimum logical height: the classic 480x320 frame the fixed-layout scenes were authored for. */
export const GAME_HEIGHT = 320;
/** Logical width of the original fixed-layout scenes. */
export const BASE_WIDTH = 480;
const MAX_LOGICAL_WIDTH = 800;
/** Keep touch controls this far (logical px) from the left/right screen edges (camera cutout, rounded corners). */
export const SAFE_INSET_X = 24;

/**
 * Crisp rendering: the canvas is sized to the device's real pixels and every scene's camera
 * zooms by an integer SCREEN_K, so one logical pixel is exactly K device pixels (no fractional
 * stretching) and text can be rasterised at K x resolution. Scene code keeps working in logical
 * units; use LOGICAL_W / LOGICAL_H (not scene.scale.*, which is now in canvas pixels).
 *
 *   Galaxy S25 landscape: 2340x1080 device px -> K = 3, logical 780x360, canvas 2340x1080.
 */
const dpr = window.devicePixelRatio || 1;
const devW = Math.max(1, Math.round(window.innerWidth * dpr));
const devH = Math.max(1, Math.round(window.innerHeight * dpr));

export const SCREEN_K = Math.max(1, Math.floor(devH / GAME_HEIGHT));
export const LOGICAL_H = Math.max(GAME_HEIGHT, Math.floor(devH / SCREEN_K));
export const LOGICAL_W = Math.min(MAX_LOGICAL_WIDTH, Math.max(BASE_WIDTH, Math.floor(devW / SCREEN_K)));
export const CANVAS_W = LOGICAL_W * SCREEN_K;
export const CANVAS_H = LOGICAL_H * SCREEN_K;

/**
 * Zoom a scene's main camera by SCREEN_K. With the default origin the zoom is about the screen
 * centre (what startFollow / setBounds expect - use that for scrolling world scenes); with
 * topLeft the camera's (0,0) stays at the top-left, so scrollFactor(0) overlays and fixed
 * layouts can be positioned in plain logical coordinates.
 */
export function applyScreenScale(scene: Phaser.Scene, topLeft = true): Phaser.Cameras.Scene2D.Camera {
  const cam = scene.cameras.main;
  cam.setZoom(SCREEN_K);
  if (topLeft) cam.setOrigin(0, 0);
  return cam;
}

/** Centre a scene authored for BASE_WIDTH x GAME_HEIGHT inside the (possibly larger) canvas. */
export function centerFixedLayout(scene: Phaser.Scene, bgColor = 0x08091a): void {
  const cam = applyScreenScale(scene);
  cam.setScroll(-(LOGICAL_W - BASE_WIDTH) / 2, -(LOGICAL_H - GAME_HEIGHT) / 2);
  cam.setBackgroundColor(bgColor);
}

const env = import.meta.env;

function num(value: unknown, fallback: number): number {
  const n = Number(value);
  return value !== undefined && value !== "" && Number.isFinite(n) ? n : fallback;
}

/** Show an FPS / resolution overlay. On by default in dev servers, opt-in (VITE_DEBUG_FPS=1) for builds. */
export const DEBUG_FPS: boolean = env.VITE_DEBUG_FPS !== undefined ? env.VITE_DEBUG_FPS === "1" : env.DEV;
/** Multiplier on every zone's wild-encounter probability (0 = none, 2 = double). */
export const ENCOUNTER_RATE_MULT: number = Math.max(0, num(env.VITE_ENCOUNTER_RATE_MULT, 1));
/** Multiplier on the in-game clock speed (2 = day/night cycle twice as fast). */
export const CLOCK_SPEED_MULT: number = Math.max(0.01, num(env.VITE_CLOCK_SPEED_MULT, 1));

/** Draws a small live FPS readout in the top-left corner of the given scene. */
export function attachFpsOverlay(scene: Phaser.Scene): void {
  if (!DEBUG_FPS) return;
  const text = scene.add
    .text(4, 2, "", { fontSize: "8px", color: "#7CFC00", fontFamily: "monospace", backgroundColor: "#000000aa" })
    .setScrollFactor(0)
    .setDepth(1000);
  const update = () => {
    text.setText(
      `${Math.round(scene.game.loop.actualFps)} fps  ${LOGICAL_W}x${LOGICAL_H} x${SCREEN_K}  dpr${window.devicePixelRatio.toFixed(2)}`,
    );
  };
  update();
  const timer = scene.time.addEvent({ delay: 250, loop: true, callback: update });
  scene.events.once("shutdown", () => timer.remove());
}
