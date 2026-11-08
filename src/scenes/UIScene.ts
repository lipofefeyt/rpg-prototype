import Phaser from "phaser";
import { DialogueBox } from "@/systems/DialogueBox";
import { TouchControls } from "@/systems/TouchControls";
import { getTouchState } from "@/systems/touchInput";

export class UIScene extends Phaser.Scene {
  private dialogueBox!: DialogueBox;
  private touchControls!: TouchControls;
  private confirmKey!: Phaser.Input.Keyboard.Key;
  private openCooldown = 0; // frames to ignore Z after dialogue opens (prevents double-trigger)

  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    this.dialogueBox = new DialogueBox(this);
    this.touchControls = new TouchControls(this, getTouchState(this.game));
    this.confirmKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    this.game.events.on("dialogue:show", (payload: { pages: string[]; speaker?: string }) => {
      this.dialogueBox.show(payload.pages, payload.speaker);
      this.openCooldown = 3;
      this.touchControls.setVisible(false); // d-pad/action overlap the dialogue box
    }, this);
    this.game.events.on("dialogue:done", () => {
      this.touchControls.setVisible(true);
    }, this);

    // Tap-anywhere-to-advance for touch: mirrors the Z-key advance below.
    // Reached only while the dialogue box is visible, by which point the
    // d-pad/action overlay is hidden+non-interactive, so there's no
    // competing touch target underneath.
    this.input.on("pointerdown", () => {
      if (this.openCooldown > 0) return;
      if (this.dialogueBox.visible) this.dialogueBox.advance();
    });

    // The overlay renders fixed-to-screen on top of WorldScene regardless of
    // pause state (a paused scene keeps rendering/receiving input in Phaser),
    // so it must be hidden explicitly whenever UIScene itself is paused -
    // i.e. whenever BattleScene is active (see WorldScene.checkEncounter).
    this.events.on(Phaser.Scenes.Events.PAUSE, () => this.touchControls.setVisible(false));
    this.events.on(Phaser.Scenes.Events.RESUME, () => this.touchControls.setVisible(true));
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
