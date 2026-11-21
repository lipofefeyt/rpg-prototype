import type Phaser from "phaser";

/**
 * Scale that shows a sprite texture at `logicalPx` logical pixels wide, whatever its art
 * resolution (64 or 96 design pixels, enhanced to SCREEN_K x). Use it where a sprite must have
 * a fixed on-screen size (world bosses, the starter pick), unlike battle sprites, which show at
 * their natural SPRITE_SCALE size.
 */
export function fitSpriteScale(scene: Phaser.Scene, key: string, logicalPx: number): number {
  return logicalPx / (scene.textures.get(key).getSourceImage().width as number);
}
