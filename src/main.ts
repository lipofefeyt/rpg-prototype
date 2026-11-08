import Phaser from "phaser";
import { BootScene } from "@/scenes/BootScene";
import { PreloadScene } from "@/scenes/PreloadScene";
import { StarterScene } from "@/scenes/StarterScene";
import { WorldScene } from "@/scenes/WorldScene";
import { BattleScene } from "@/scenes/BattleScene";
import { UIScene } from "@/scenes/UIScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 320,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: "#000",
  scene: [BootScene, PreloadScene, StarterScene, WorldScene, BattleScene, UIScene],
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
};

new Phaser.Game(config);
