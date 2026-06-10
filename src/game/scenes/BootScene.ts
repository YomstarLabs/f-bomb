import Phaser from 'phaser';
import type { GameSettings } from '../systems/settingsService';

export type SceneRunConfig = {
  levelId: string;
  settings: GameSettings;
};

export default class BootScene extends Phaser.Scene {
  private readonly runConfig: SceneRunConfig;

  constructor(runConfig: SceneRunConfig) {
    super('BootScene');
    this.runConfig = runConfig;
  }

  create(): void {
    this.scene.start('PreloadScene', this.runConfig);
  }
}
