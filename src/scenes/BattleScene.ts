import Phaser from "phaser";

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  create() {
    // Placeholder — battle system implemented in M3
    this.add.text(240, 160, "BATTLE", {
      fontSize: "16px",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.input.keyboard!.once("keydown-ESCAPE", () => {
      this.scene.stop();
      this.scene.resume("WorldScene");
    });
  }
}
