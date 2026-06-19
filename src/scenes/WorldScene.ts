import Phaser from "phaser";
import { TILE_SIZE } from "@/constants";

const MOVE_SPEED = 80;

type Direction = "up" | "down" | "left" | "right";

interface PlayerState {
  direction: Direction;
  isMoving: boolean;
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private playerBody!: Phaser.Physics.Arcade.Body;
  private state: PlayerState = { direction: "down", isMoving: false };

  constructor() {
    super({ key: "WorldScene" });
  }

  create() {
    // Placeholder player (16x16 rectangle) until sprites are loaded
    this.player = this.add.rectangle(240, 160, TILE_SIZE, TILE_SIZE, 0xff0000);
    this.physics.add.existing(this.player);
    this.playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    this.playerBody.setCollideWorldBounds(true);

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setZoom(1);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Start the persistent UI overlay
    this.scene.launch("UIScene");
  }

  update() {
    this.handleMovement();
  }

  private handleMovement() {
    const up = this.cursors.up.isDown || this.wasd.up.isDown;
    const down = this.cursors.down.isDown || this.wasd.down.isDown;
    const left = this.cursors.left.isDown || this.wasd.left.isDown;
    const right = this.cursors.right.isDown || this.wasd.right.isDown;

    this.playerBody.setVelocity(0);

    if (up) {
      this.playerBody.setVelocityY(-MOVE_SPEED);
      this.state.direction = "up";
    } else if (down) {
      this.playerBody.setVelocityY(MOVE_SPEED);
      this.state.direction = "down";
    }

    if (left) {
      this.playerBody.setVelocityX(-MOVE_SPEED);
      this.state.direction = "left";
    } else if (right) {
      this.playerBody.setVelocityX(MOVE_SPEED);
      this.state.direction = "right";
    }

    // Normalize diagonal movement
    if ((up || down) && (left || right)) {
      this.playerBody.velocity.normalize().scale(MOVE_SPEED);
    }

    this.state.isMoving = up || down || left || right;
  }
}
