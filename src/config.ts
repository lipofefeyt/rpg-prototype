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

export const GAME_HEIGHT = 320;
/** Logical width of the original fixed-layout scenes. */
export const BASE_WIDTH = 480;
const MAX_WIDTH = 720;
/** Keep touch controls this far (logical px) from the left/right screen edges (camera cutout, rounded corners). */
export const SAFE_INSET_X = 24;

export function computeGameWidth(): number {
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  return Math.min(MAX_WIDTH, Math.max(BASE_WIDTH, Math.round(GAME_HEIGHT * aspect)));
}

/** Centre a scene authored for BASE_WIDTH x GAME_HEIGHT inside the (possibly wider) canvas. */
export function centerFixedLayout(scene: Phaser.Scene, bgColor = 0x08091a): void {
  const cam = scene.cameras.main;
  cam.setScroll(-(scene.scale.width - BASE_WIDTH) / 2, 0);
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
    const { width, height } = scene.scale.gameSize;
    text.setText(
      `${Math.round(scene.game.loop.actualFps)} fps  ${width}x${height}  dpr${window.devicePixelRatio.toFixed(2)}`,
    );
  };
  update();
  const timer = scene.time.addEvent({ delay: 250, loop: true, callback: update });
  scene.events.once("shutdown", () => timer.remove());
}
