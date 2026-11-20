import Phaser from "phaser";

/**
 * Tween-based sprite animation for battle sprites. The art is static (one frame per
 * pose), so motion is built from squash/stretch, lunges and projectiles - this works
 * for every hero and monster without extra frames.
 *
 * All functions expect the sprite to use origin (0.5, 1) (feet on the ground) and to
 * have its resting position stored via `anchor()`. Only one "action" runs per sprite
 * at a time: actions stop the idle loop first and `resumeIdle()` it afterwards.
 */

const IDLE_KEY = "idleTween";

/** Remembers the sprite's resting pose so actions can always return to it. */
export function anchor(sprite: Phaser.GameObjects.Image): void {
  sprite.setData("baseX", sprite.x).setData("baseY", sprite.y).setData("baseScale", sprite.scaleX);
}

function base(sprite: Phaser.GameObjects.Image) {
  return {
    x: sprite.getData("baseX") as number,
    y: sprite.getData("baseY") as number,
    s: (sprite.getData("baseScale") as number) ?? 1,
  };
}

function resetPose(sprite: Phaser.GameObjects.Image): void {
  const b = base(sprite);
  sprite.setPosition(b.x, b.y).setScale(b.s).setAngle(0).setAlpha(1);
}

/** Gentle breathing loop (slow squash/stretch). `phase` desyncs sprites from each other. */
export function startIdle(scene: Phaser.Scene, sprite: Phaser.GameObjects.Image, opts: { period?: number; amount?: number } = {}): void {
  stopIdle(sprite);
  const b = base(sprite);
  const amount = opts.amount ?? 0.045;
  const tween = scene.tweens.add({
    targets: sprite,
    scaleY: b.s * (1 + amount),
    scaleX: b.s * (1 - amount * 0.5),
    duration: opts.period ?? 850,
    delay: Math.random() * 400,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  sprite.setData(IDLE_KEY, tween);
}

export function stopIdle(sprite: Phaser.GameObjects.Image): void {
  // Kill every tween on the sprite (not just the idle loop) so a new action can never
  // fight a leftover one for control of the same properties.
  sprite.setData(IDLE_KEY, undefined);
  sprite.scene?.tweens.killTweensOf(sprite);
  if (sprite.getData("baseX") !== undefined) {
    const b = base(sprite);
    sprite.setScale(b.s);
  }
}

/** Slide in from off-screen (dir -1 = from the left, +1 = from the right) with a landing squash. */
export function playEntrance(scene: Phaser.Scene, sprite: Phaser.GameObjects.Image, dir: -1 | 1, onDone?: () => void): void {
  stopIdle(sprite);
  const b = base(sprite);
  sprite.setPosition(b.x + dir * 120, b.y).setAlpha(0);
  scene.tweens.add({
    targets: sprite, x: b.x, alpha: 1, duration: 420, ease: "Cubic.easeOut",
    onComplete: () => {
      // landing squash
      scene.tweens.add({
        targets: sprite, scaleY: b.s * 0.88, scaleX: b.s * 1.1, duration: 90, yoyo: true, ease: "Quad.easeOut",
        onComplete: () => { resetPose(sprite); startIdle(scene, sprite); onDone?.(); },
      });
    },
  });
}

/** Pop-in used when a new fighter is sent into battle. */
export function playSendIn(scene: Phaser.Scene, sprite: Phaser.GameObjects.Image): void {
  stopIdle(sprite);
  resetPose(sprite);
  sprite.setVisible(true);
  const b = base(sprite);
  sprite.setScale(b.s * 0.2).setAlpha(0.2);
  scene.tweens.add({
    targets: sprite, scaleX: b.s, scaleY: b.s, alpha: 1, duration: 260, ease: "Back.easeOut",
    onComplete: () => { resetPose(sprite); startIdle(scene, sprite); },
  });
}

export interface AttackOpts {
  /** +1 = target is to the right of the attacker, -1 = to the left. */
  dir: -1 | 1;
  /** "melee" lunges into the target; "cast" rears back and fires a projectile. */
  style: "melee" | "cast";
  /** Projectile / flash colour for casts. */
  color: number;
  /** Target sprite (for projectile aim). */
  target: Phaser.GameObjects.Image;
}

/** Plays the attacker's animation; [onImpact] fires at the moment the hit lands, [onDone] when the attacker has settled. */
export function playAttack(
  scene: Phaser.Scene, sprite: Phaser.GameObjects.Image, opts: AttackOpts,
  onImpact: () => void, onDone: () => void,
): void {
  stopIdle(sprite);
  resetPose(sprite);
  const b = base(sprite);

  const settle = () => {
    scene.tweens.add({
      targets: sprite, x: b.x, y: b.y, scaleX: b.s, scaleY: b.s, angle: 0, duration: 160, ease: "Quad.easeOut",
      onComplete: () => { resetPose(sprite); startIdle(scene, sprite); onDone(); },
    });
  };

  if (opts.style === "melee") {
    // wind up (pull back + crouch) -> dash through -> impact -> return
    scene.tweens.add({
      targets: sprite, x: b.x - opts.dir * 10, scaleY: b.s * 0.9, scaleX: b.s * 1.06, duration: 130, ease: "Quad.easeOut",
      onComplete: () => {
        scene.tweens.add({
          targets: sprite, x: b.x + opts.dir * 52, scaleY: b.s, scaleX: b.s * 0.96, duration: 110, ease: "Cubic.easeIn",
          onComplete: () => { onImpact(); scene.time.delayedCall(120, settle); },
        });
      },
    });
    return;
  }

  // cast: rise + glow, then a projectile flies to the target
  const glow = scene.add.circle(sprite.x, sprite.y - sprite.displayHeight * 0.5, 6, opts.color, 0.9).setDepth(sprite.depth + 1);
  scene.tweens.add({
    targets: sprite, y: b.y - 6, scaleY: b.s * 1.08, scaleX: b.s * 0.95, duration: 220, ease: "Sine.easeOut",
  });
  scene.tweens.add({
    targets: glow, scale: 2.2, duration: 220, ease: "Sine.easeOut",
    onComplete: () => {
      const tx = opts.target.x;
      const ty = opts.target.y - opts.target.displayHeight * 0.5;
      scene.tweens.add({
        targets: glow, x: tx, y: ty, scale: 1.4, duration: 240, ease: "Quad.easeIn",
        onComplete: () => {
          // impact burst
          scene.tweens.add({ targets: glow, scale: 4, alpha: 0, duration: 200, onComplete: () => glow.destroy() });
          onImpact();
          settle();
        },
      });
    },
  });
}

/** Self-targeted / status move: a quick pulse with a colour ring. */
export function playBuff(scene: Phaser.Scene, sprite: Phaser.GameObjects.Image, color: number, onDone: () => void): void {
  stopIdle(sprite);
  resetPose(sprite);
  const b = base(sprite);
  const ring = scene.add.ellipse(sprite.x, sprite.y - 4, 20, 8, color, 0.7).setDepth(sprite.depth - 1);
  scene.tweens.add({ targets: ring, scaleX: 3.2, scaleY: 2.4, alpha: 0, duration: 380, ease: "Quad.easeOut", onComplete: () => ring.destroy() });
  scene.tweens.add({
    targets: sprite, scaleY: b.s * 1.12, scaleX: b.s * 0.94, duration: 160, yoyo: true, repeat: 1, ease: "Sine.easeInOut",
    onComplete: () => { resetPose(sprite); startIdle(scene, sprite); onDone(); },
  });
}

/** Recoil + flash when hit (replaces the plain shake). */
export function playHit(scene: Phaser.Scene, sprite: Phaser.GameObjects.Image, dir: -1 | 1, onDone: () => void): void {
  stopIdle(sprite);
  resetPose(sprite);
  const b = base(sprite);
  sprite.setTintFill(0xffffff);
  scene.time.delayedCall(70, () => sprite.clearTint());
  scene.tweens.add({
    targets: sprite, x: b.x + dir * 8, angle: dir * 6, duration: 60, yoyo: true, repeat: 2, ease: "Linear",
    onComplete: () => { resetPose(sprite); startIdle(scene, sprite); onDone(); },
  });
}

/** Knocked out: sink, fade and flatten. */
export function playFaint(scene: Phaser.Scene, sprite: Phaser.GameObjects.Image, onDone: () => void): void {
  stopIdle(sprite);
  resetPose(sprite);
  const b = base(sprite);
  scene.tweens.add({
    targets: sprite, y: b.y + 14, scaleY: b.s * 0.15, scaleX: b.s * 1.15, alpha: 0, duration: 520, ease: "Quad.easeIn",
    onComplete: onDone,
  });
}

/** Tamed by a charm: the monster shrinks into a glowing mote. */
export function playTamed(scene: Phaser.Scene, sprite: Phaser.GameObjects.Image, onDone: () => void): void {
  stopIdle(sprite);
  resetPose(sprite);
  const b = base(sprite);
  scene.tweens.add({
    targets: sprite, scale: b.s * 0.05, y: b.y - sprite.displayHeight * 0.4, alpha: 0.4, duration: 380, ease: "Back.easeIn",
    onComplete: () => { sprite.setVisible(false); onDone(); },
  });
}

/** Charm shake: a short wobble (works on any game object, e.g. the charm). */
export function playWobble(scene: Phaser.Scene, obj: Phaser.GameObjects.GameObject & { angle: number }): void {
  scene.tweens.add({ targets: obj, angle: { from: -12, to: 12 }, duration: 90, yoyo: true, repeat: 2, onComplete: () => { obj.angle = 0; } });
}
