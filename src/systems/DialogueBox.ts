import Phaser from "phaser";
import { drawPanel } from "@/gfx/panel";
import { BASE_WIDTH, SAFE_INSET_X, LOGICAL_W, LOGICAL_H } from "@/config";

const PAD           = 10;
const BOX_H         = 74;
const MARGIN        = 8;
const SPEAKER_H     = 20;
const SPEAKER_GAP   = 3;
const CHAR_DELAY_MS = 26;

export class DialogueBox {
  private readonly scene: Phaser.Scene;
  private readonly panel: Phaser.GameObjects.Graphics;
  private readonly textObj: Phaser.GameObjects.Text;
  private readonly arrow: Phaser.GameObjects.Text;
  private readonly speakerPanel: Phaser.GameObjects.Graphics;
  private readonly speakerLabel: Phaser.GameObjects.Text;

  private pages: string[] = [];
  private pageIndex = 0;
  private isTyping = false;
  private fullText = "";
  private typeTimer?: Phaser.Time.TimerEvent;
  private arrowTween?: Phaser.Tweens.Tween;
  private hasSpeaker = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const W    = LOGICAL_W;
    const H    = LOGICAL_H;
    const side = W > BASE_WIDTH ? SAFE_INSET_X : MARGIN; // keep clear of the camera cutout on wide screens
    const boxW = W - side * 2;
    const boxX = side;
    const boxY = H - BOX_H - MARGIN;

    // ── Speaker name panel ───────────────────────────────────────────────────
    const spY = boxY - SPEAKER_H - SPEAKER_GAP;
    this.speakerPanel = scene.add.graphics();
    drawPanel(this.speakerPanel, boxX, spY, 90, SPEAKER_H, { cut: 2, fill: 0x08081a, fillAlpha: 0.96, border: 0x4a7ee0 });

    this.speakerLabel = scene.add.text(boxX + 7, spY + 4, "", {
      fontSize: "10px",
      color: "#aaccff",
      fontFamily: "monospace",
      fontStyle: "bold",
    });

    // ── Main dialogue panel ──────────────────────────────────────────────────
    this.panel = scene.add.graphics();
    drawPanel(this.panel, boxX, boxY, boxW, BOX_H, { cut: 2, fill: 0x08081a, fillAlpha: 0.95, border: 0x4a7ee0 });

    this.textObj = scene.add.text(boxX + PAD, boxY + PAD, "", {
      fontSize: "11px",
      color: "#e8eeff",
      fontFamily: "monospace",
      wordWrap: { width: boxW - PAD * 2 - 12 },
      lineSpacing: 5,
    });

    this.arrow = scene.add.text(boxX + boxW - 14, boxY + BOX_H - 14, "▼", {
      fontSize: "9px",
      color: "#88aaff",
      fontFamily: "monospace",
    }).setVisible(false);

    const depth = 100;
    [this.speakerPanel, this.speakerLabel, this.panel, this.textObj, this.arrow]
      .forEach(o => o.setDepth(depth));

    this.setVisible(false);
  }

  get visible(): boolean { return this.panel.visible; }

  show(pages: string[], speaker?: string): void {
    this.pages = pages;
    this.pageIndex = 0;
    this.hasSpeaker = !!speaker;
    this.speakerLabel.setText(speaker ?? "");
    this.setVisible(true);
    this.typePage(pages[0]);
  }

  advance(): void {
    if (this.isTyping) {
      this.skipTypewriter();
      return;
    }
    this.pageIndex++;
    if (this.pageIndex < this.pages.length) {
      this.typePage(this.pages[this.pageIndex]);
    } else {
      this.close();
    }
  }

  close(): void {
    this.typeTimer?.remove();
    this.arrowTween?.stop();
    this.setVisible(false);
    this.scene.game.events.emit("dialogue:done");
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private typePage(text: string): void {
    this.fullText = text;
    this.isTyping = true;
    this.textObj.setText("");
    this.arrowTween?.stop();
    this.arrow.setVisible(false).setAlpha(1);

    this.typeTimer?.remove();
    let i = 0;
    this.typeTimer = this.scene.time.addEvent({
      delay: CHAR_DELAY_MS,
      repeat: text.length - 1,
      callback: () => {
        i++;
        this.textObj.setText(text.slice(0, i));
        if (i >= text.length) this.onPageComplete();
      },
    });
  }

  private skipTypewriter(): void {
    this.typeTimer?.remove();
    this.textObj.setText(this.fullText);
    this.isTyping = false;
    this.onPageComplete();
  }

  private onPageComplete(): void {
    this.isTyping = false;
    this.arrow.setVisible(true);
    this.arrowTween = this.scene.tweens.add({
      targets: this.arrow,
      alpha: 0.2,
      duration: 420,
      yoyo: true,
      repeat: -1,
    });
  }

  private setVisible(v: boolean): void {
    this.panel.setVisible(v);
    this.textObj.setVisible(v);
    this.arrow.setVisible(v && !this.isTyping);
    this.speakerPanel.setVisible(v && this.hasSpeaker);
    this.speakerLabel.setVisible(v && this.hasSpeaker);
  }
}
