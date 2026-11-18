import Phaser from "phaser";
import { BootScene } from "@/scenes/BootScene";
import { PreloadScene } from "@/scenes/PreloadScene";
import { StarterScene } from "@/scenes/StarterScene";
import { WorldScene } from "@/scenes/WorldScene";
import { BattleScene } from "@/scenes/BattleScene";
import { UIScene } from "@/scenes/UIScene";
import { MenuScene } from "@/scenes/MenuScene";
import { GAME_HEIGHT, computeGameWidth } from "@/config";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: computeGameWidth(),
  height: GAME_HEIGHT,
  pixelArt: true,
  input: { activePointers: 3 }, // d-pad + A (+ spare) can be held at once on touch screens
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: "#000",
  scene: [BootScene, PreloadScene, StarterScene, WorldScene, BattleScene, UIScene, MenuScene],
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
};

new Phaser.Game(config);
