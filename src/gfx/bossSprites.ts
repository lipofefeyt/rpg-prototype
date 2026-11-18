import Phaser from "phaser";

/** Cavern Warden: a hulking crystal-studded stone guardian (64x64, front view). */
const ROCK = 0x6b6577, ROCK_D = 0x4a4556, ROCK_L = 0x8d869b, OUT = 0x2a2634;
const CRYS = 0xb44ae0, CRYS_L = 0xe08aff, EYE = 0xff3b30, EYE_L = 0xffb0a0;

export function drawWardenFront(g: Phaser.GameObjects.Graphics): void {
  const R = (c: number, x: number, y: number, w: number, h: number) => { g.fillStyle(c); g.fillRect(x, y, w, h); };

  // legs
  R(OUT, 15, 45, 16, 17); R(ROCK_D, 16, 46, 14, 15); R(ROCK, 16, 46, 10, 13); R(ROCK_L, 17, 47, 3, 6);
  R(OUT, 33, 45, 16, 17); R(ROCK_D, 34, 46, 14, 15); R(ROCK, 34, 46, 10, 13); R(ROCK_L, 35, 47, 3, 6);
  // arms + fists
  R(OUT, 2, 26, 13, 26); R(ROCK_D, 3, 27, 11, 24); R(ROCK, 3, 27, 8, 22); R(ROCK_L, 4, 28, 2, 10);
  R(OUT, 49, 26, 13, 26); R(ROCK_D, 50, 27, 11, 24); R(ROCK, 50, 27, 8, 22); R(ROCK_L, 51, 28, 2, 10);
  R(OUT, 1, 50, 15, 11); R(ROCK_D, 2, 51, 13, 9); R(ROCK_L, 3, 52, 4, 3);
  R(OUT, 48, 50, 15, 11); R(ROCK_D, 49, 51, 13, 9); R(ROCK_L, 50, 52, 4, 3);
  // torso
  R(OUT, 12, 22, 40, 26); R(ROCK, 13, 23, 38, 24); R(ROCK_L, 14, 24, 10, 6); R(ROCK_D, 13, 40, 38, 7);
  // shoulders
  R(OUT, 6, 17, 18, 13); R(ROCK, 7, 18, 16, 11); R(ROCK_L, 8, 19, 6, 3);
  R(OUT, 40, 17, 18, 13); R(ROCK, 41, 18, 16, 11); R(ROCK_L, 42, 19, 6, 3);
  // head
  R(OUT, 21, 5, 22, 19); R(ROCK, 22, 6, 20, 17); R(ROCK_L, 23, 7, 7, 3); R(ROCK_D, 22, 19, 20, 4);
  R(EYE, 26, 12, 4, 3); R(EYE, 34, 12, 4, 3); R(EYE_L, 27, 12, 2, 1); R(EYE_L, 35, 12, 2, 1);
  R(OUT, 28, 18, 8, 2);
  // crystals: crown, shoulders, chest core
  R(CRYS, 25, 1, 3, 6); R(CRYS_L, 26, 2, 1, 3); R(CRYS, 30, 0, 4, 8); R(CRYS_L, 31, 1, 1, 4); R(CRYS, 36, 2, 3, 5);
  R(CRYS, 9, 12, 4, 7); R(CRYS_L, 10, 13, 1, 3); R(CRYS, 51, 12, 4, 7); R(CRYS_L, 52, 13, 1, 3);
  R(OUT, 27, 31, 10, 11); R(CRYS, 28, 32, 8, 9); R(CRYS_L, 29, 33, 3, 4);
  // cracks
  R(ROCK_D, 19, 28, 1, 6); R(ROCK_D, 20, 33, 2, 1); R(ROCK_D, 44, 30, 1, 7); R(ROCK_D, 42, 36, 2, 1);
}
