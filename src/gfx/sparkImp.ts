import Phaser from "phaser";

/**
 * Spark Imp (species 25): a small horned storm imp - indigo skin, spark-tipped horns,
 * glowing cyan eyes, lightning-bolt tail. Original design (64x64, front + back).
 */

type G = Phaser.GameObjects.Graphics;

const BODY = 0x3b3a8a, BODY_D = 0x26255e, BODY_L = 0x5a58b8, HORN = 0xe8e0ff;
const CYAN = 0x6ae6ff, WHITE = 0xeaffff, SPARK = 0xffe14a, OUT = 0x16153a;

function helpers(g: G) {
  const R = (c: number, x: number, y: number, w: number, h: number) => { g.fillStyle(c); g.fillRect(x, y, w, h); };
  const C = (c: number, y: number, w: number, h: number) => R(c, 32 - w / 2, y, w, h);
  return { R, C };
}

/** Jagged lightning-bolt tail, rising from the lower back to a bright tip. */
function bolt(R: ReturnType<typeof helpers>["R"], x: number, y: number): void {
  R(OUT, x - 1, y - 1, 9, 6);   R(CYAN, x, y, 7, 4);          // base
  R(OUT, x + 4, y - 7, 6, 8);   R(CYAN, x + 5, y - 6, 4, 6);   // up
  R(OUT, x + 1, y - 11, 8, 5);  R(WHITE, x + 2, y - 10, 6, 3); // back left
  R(OUT, x + 4, y - 17, 6, 7);  R(CYAN, x + 5, y - 16, 4, 5);  // up again
  R(SPARK, x + 4, y - 22, 6, 6); R(WHITE, x + 6, y - 20, 2, 2); // tip spark
}

export function drawSparkImpFront(g: G): void {
  const { R, C } = helpers(g);
  C(0x2a2634, 59, 28, 2);                                   // ground shadow
  bolt(R, 50, 52);
  // legs + claws
  R(OUT, 20, 49, 11, 11); R(BODY_D, 21, 50, 9, 9); R(BODY, 21, 50, 6, 7);
  R(OUT, 33, 49, 11, 11); R(BODY_D, 34, 50, 9, 9); R(BODY, 34, 50, 6, 7);
  R(HORN, 21, 58, 2, 2); R(HORN, 25, 58, 2, 2); R(HORN, 35, 58, 2, 2); R(HORN, 39, 58, 2, 2);
  // body + belly
  R(OUT, 17, 31, 30, 22); R(BODY, 18, 32, 28, 20); R(BODY_D, 18, 46, 28, 6);
  C(BODY_L, 36, 14, 11);
  // lightning mark on the belly
  R(CYAN, 33, 36, 4, 2); R(CYAN, 30, 38, 4, 2); R(CYAN, 33, 40, 4, 2); R(CYAN, 30, 42, 4, 2); R(WHITE, 31, 44, 3, 2);
  // arms hanging at the sides, hands crackling with sparks
  R(OUT, 8, 33, 10, 19); R(BODY, 9, 34, 8, 17); R(BODY_L, 9, 35, 3, 9);
  R(OUT, 46, 33, 10, 19); R(BODY, 47, 34, 8, 17); R(BODY_L, 47, 35, 3, 9);
  R(CYAN, 9, 50, 8, 5); R(WHITE, 12, 51, 2, 2); R(CYAN, 12, 47, 2, 9);        // left hand spark
  R(CYAN, 47, 50, 8, 5); R(WHITE, 50, 51, 2, 2); R(CYAN, 50, 47, 2, 9);       // right hand spark
  // pointed ears
  R(OUT, 8, 11, 9, 13); R(BODY_D, 9, 12, 7, 11); R(BODY_L, 10, 14, 3, 6);
  R(OUT, 47, 11, 9, 13); R(BODY_D, 48, 12, 7, 11); R(BODY_L, 51, 14, 3, 6);
  // head
  R(OUT, 14, 9, 36, 25); R(BODY, 15, 10, 34, 23); R(BODY_L, 17, 11, 10, 4);
  R(BODY_D, 15, 28, 34, 5);
  // horns with spark tips
  R(OUT, 20, 2, 6, 10); R(HORN, 21, 3, 4, 8); R(CYAN, 21, 0, 4, 4);
  R(OUT, 38, 2, 6, 10); R(HORN, 39, 3, 4, 8); R(CYAN, 39, 0, 4, 4);
  // slanted brows, glowing eyes
  R(BODY_D, 21, 16, 9, 2); R(BODY_D, 34, 16, 9, 2);
  R(OUT, 22, 18, 9, 8); R(WHITE, 23, 19, 7, 6); R(CYAN, 25, 20, 4, 4); R(OUT, 26, 21, 2, 2);
  R(OUT, 33, 18, 9, 8); R(WHITE, 34, 19, 7, 6); R(CYAN, 36, 20, 4, 4); R(OUT, 37, 21, 2, 2);
  // wide grin with fangs
  R(OUT, 23, 27, 18, 5); R(0xb23a5a, 24, 28, 16, 3);
  R(WHITE, 25, 27, 3, 3); R(WHITE, 36, 27, 3, 3);
}

export function drawSparkImpBack(g: G): void {
  const { R, C } = helpers(g);
  C(0x2a2634, 60, 28, 2);
  // legs
  R(OUT, 20, 52, 11, 9); R(BODY_D, 21, 53, 9, 7);
  R(OUT, 33, 52, 11, 9); R(BODY_D, 34, 53, 9, 7);
  // back
  R(OUT, 15, 30, 34, 25); R(BODY, 16, 31, 32, 23); R(BODY_D, 16, 46, 32, 8);
  C(BODY_L, 33, 6, 14);
  // jagged spine ridge of sparks
  for (let i = 0; i < 4; i++) R(CYAN, 30 + (i % 2) * 3, 34 + i * 4, 4, 2);
  // arms down
  R(OUT, 7, 32, 9, 18); R(BODY_D, 8, 33, 7, 16);
  R(OUT, 48, 32, 9, 18); R(BODY_D, 49, 33, 7, 16);
  bolt(R, 50, 54);
  // ears, head from behind, horns
  R(OUT, 8, 10, 9, 13); R(BODY_D, 9, 11, 7, 11);
  R(OUT, 47, 10, 9, 13); R(BODY_D, 48, 11, 7, 11);
  R(OUT, 14, 8, 36, 25); R(BODY, 15, 9, 34, 23); R(BODY_D, 15, 26, 34, 6); R(BODY_L, 17, 10, 10, 4);
  R(OUT, 20, 1, 6, 10); R(HORN, 21, 2, 4, 8); R(CYAN, 21, 0, 4, 3);
  R(OUT, 38, 1, 6, 10); R(HORN, 39, 2, 4, 8); R(CYAN, 39, 0, 4, 3);
  R(SPARK, 30, 8, 4, 4); R(WHITE, 31, 9, 2, 2);                 // spark at the crown
}
