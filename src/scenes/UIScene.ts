import Phaser from "phaser";
import { DialogueBox } from "@/systems/DialogueBox";

export class UIScene extends Phaser.Scene {
  private dialogueBox!: DialogueBox;
  private confirmKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    this.dialogueBox = new DialogueBox(this);

    this.confirmKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // WorldScene emits 'dialogue:show' with a string[] of pages
    this.game.events.on("dialogue:show", (pages: string[]) => {
      this.dialogueBox.show(pages);
    }, this);
  }

  update() {
    if (this.dialogueBox.visible && Phaser.Input.Keyboard.JustDown(this.confirmKey)) {
      this.dialogueBox.advance();
    }
  }
}
