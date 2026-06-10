import Phaser from 'phaser';
import BootScene, { type SceneRunConfig } from './scenes/BootScene';
import LevelPlayScene from './scenes/LevelPlayScene';
import PreloadScene from './scenes/PreloadScene';

export function createFbombGame(
  parent: HTMLElement,
  runConfig: SceneRunConfig,
): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 540,
    backgroundColor: '#91d8f7',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 920, x: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [new BootScene(runConfig), PreloadScene, LevelPlayScene],
  });
}
