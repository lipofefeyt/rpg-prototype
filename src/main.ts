import Phaser from "phaser";
import { BootScene } from "@/scenes/BootScene";
import { PreloadScene } from "@/scenes/PreloadScene";
import { TitleScene } from "@/scenes/TitleScene";
import { StarterScene } from "@/scenes/StarterScene";
import { WorldScene } from "@/scenes/WorldScene";
import { BattleScene } from "@/scenes/BattleScene";
import { UIScene } from "@/scenes/UIScene";
import { MenuScene } from "@/scenes/MenuScene";
import { CANVAS_W, CANVAS_H } from "@/config";
import { installCrispText } from "@/gfx/crispText";

installCrispText();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CANVAS_W,   // device pixels; scenes zoom their cameras by SCREEN_K (see config.ts)
  height: CANVAS_H,
  pixelArt: true,
  input: { activePointers: 3 }, // d-pad + A (+ spare) can be held at once on touch screens
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: "#000",
  scene: [BootScene, PreloadScene, TitleScene, StarterScene, WorldScene, BattleScene, UIScene, MenuScene],
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
};

new Phaser.Game(config);
