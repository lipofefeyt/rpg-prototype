import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    // Placeholder: load tilemaps, tilesets, spritesheets here
    // this.load.tilemapTiledJSON("overworld", "assets/maps/overworld.json");
    // this.load.image("tileset", "assets/tilesets/overworld.png");
    // this.load.spritesheet("player", "assets/sprites/player.png", { frameWidth: 16, frameHeight: 16 });
  }

  create() {
    this.scene.start("WorldScene");
  }
}
