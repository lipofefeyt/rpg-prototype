import Phaser from "phaser";
import { DialogueBox } from "@/systems/DialogueBox";

export class UIScene extends Phaser.Scene {
  private dialogueBox!: DialogueBox;
  private confirmKey!: Phaser.Input.Keyboard.Key;
  private openCooldown = 0; // frames to ignore Z after dialogue opens (prevents double-trigger)

  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    this.dialogueBox = new DialogueBox(this);
    this.confirmKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    this.game.events.on("dialogue:show", (payload: { pages: string[]; speaker?: string }) => {
      this.dialogueBox.show(payload.pages, payload.speaker);
      this.openCooldown = 3;
    }, this);
  }

  update() {
    if (this.openCooldown > 0) {
      this.openCooldown--;
      return;
    }
    if (this.dialogueBox.visible && Phaser.Input.Keyboard.JustDown(this.confirmKey)) {
      this.dialogueBox.advance();
    }
  }
}
