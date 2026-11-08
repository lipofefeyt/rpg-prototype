import type Phaser from "phaser";

/**
 * Shared touch-input state, held in the Phaser game registry so the
 * TouchControls overlay (drawn in UIScene) and the scenes that consume
 * input (WorldScene) can read/write the same object without a direct
 * scene reference. Mirrors the registry-backed pattern in playerState.ts.
 *
 * up/down/left/right are held state, read every frame like a keyboard
 * key's isDown. actionPressed is one-shot: TouchControls sets it true on
 * tap, and the reader must clear it after consuming it (mirrors
 * Phaser.Input.Keyboard.JustDown's single-frame-true semantics, which a
 * plain boolean can't replicate on its own without an owner to reset it).
 */
export interface TouchState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  actionPressed: boolean;
}

export function getTouchState(game: Phaser.Game): TouchState {
  let state = game.registry.get("touchState") as TouchState | undefined;
  if (!state) {
    state = { up: false, down: false, left: false, right: false, actionPressed: false };
    game.registry.set("touchState", state);
  }
  return state;
}
