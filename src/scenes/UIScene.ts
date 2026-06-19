import Phaser from "phaser";

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    // Persistent HUD overlay — runs parallel to WorldScene/BattleScene
    // Dialogue box, HP bars, menu will be added here in M2/M3
  }
}
