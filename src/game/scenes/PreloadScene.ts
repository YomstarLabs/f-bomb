import Phaser from 'phaser';
import type { SceneRunConfig } from './BootScene';

type TextureSpec = {
  key: string;
  top: number;
  base: number;
  stroke: number;
};

const blockTextures: TextureSpec[] = [
  { key: 'grass-block', top: 0x56b44a, base: 0x8c5f3d, stroke: 0x2f6d31 },
  { key: 'stone-block', top: 0x8b95a1, base: 0x66717d, stroke: 0x3e4853 },
  { key: 'crystal-block', top: 0x33a7ff, base: 0x145b91, stroke: 0x9be7ff },
  { key: 'lab-block', top: 0x5b6472, base: 0x303846, stroke: 0xffca3a },
  { key: 'spark-block', top: 0xffca3a, base: 0xa66b00, stroke: 0xfff1a8 },
  { key: 'lava-block', top: 0xff7043, base: 0x5e2a22, stroke: 0xffc857 },
  { key: 'hot-block', top: 0xff9f1c, base: 0x7a2f13, stroke: 0xffd166 },
  { key: 'crack-block', top: 0xa4adb8, base: 0x596270, stroke: 0x202631 },
  { key: 'sky-block', top: 0xbae6fd, base: 0x38bdf8, stroke: 0x2563eb },
  { key: 'gear-block', top: 0xf59e0b, base: 0x92400e, stroke: 0x451a03 },
  { key: 'gear-bridge-block', top: 0xfbbf24, base: 0x78350f, stroke: 0xfffbeb },
  { key: 'prism-block', top: 0xc4b5fd, base: 0x6d28d9, stroke: 0xf5f3ff },
  { key: 'forge-block', top: 0xfb923c, base: 0x7c2d12, stroke: 0xfed7aa },
  { key: 'fraction-block', top: 0xfed7aa, base: 0xea580c, stroke: 0xffedd5 },
  { key: 'core-block', top: 0xef4444, base: 0x1f2937, stroke: 0xfca5a5 },
];

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  init(data: SceneRunConfig): void {
    this.registry.set('runConfig', data);
  }

  create(): void {
    this.createBlockTextures();
    this.createPlayerTexture();
    this.createObjectTextures();
    this.scene.start('LevelPlayScene', this.registry.get('runConfig'));
  }

  private createBlockTextures(): void {
    for (const spec of blockTextures) {
      if (this.textures.exists(spec.key)) {
        continue;
      }

      const graphics = this.add.graphics();
      graphics.fillStyle(spec.base, 1);
      graphics.fillRect(0, 0, 32, 32);
      graphics.fillStyle(spec.top, 1);
      graphics.fillRect(0, 0, 32, 10);
      graphics.lineStyle(2, spec.stroke, 1);
      graphics.strokeRect(1, 1, 30, 30);
      graphics.lineStyle(1, spec.stroke, 0.35);
      graphics.lineBetween(9, 12, 9, 31);
      graphics.lineBetween(21, 12, 21, 31);
      graphics.generateTexture(spec.key, 32, 32);
      graphics.destroy();
    }
  }

  private createPlayerTexture(): void {
    if (this.textures.exists('player')) {
      return;
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d6cdf, 1);
    graphics.fillRect(7, 9, 18, 20);
    graphics.fillStyle(0xffd08a, 1);
    graphics.fillRect(8, 0, 16, 12);
    graphics.fillStyle(0x15345f, 1);
    graphics.fillRect(10, 4, 4, 4);
    graphics.fillRect(19, 4, 4, 4);
    graphics.fillStyle(0x1f2937, 1);
    graphics.fillRect(8, 28, 6, 4);
    graphics.fillRect(19, 28, 6, 4);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  private createObjectTextures(): void {
    this.createBomb();
    this.createDoor('door-closed', 0x9a5b22, 0xfcd34d);
    this.createDoor('door-open', 0x4f9f38, 0xd9f99d);
    this.createSpike();
    this.createSwitch();
    this.createMovingPlatform();
  }

  private createBomb(): void {
    if (this.textures.exists('formula-bomb')) {
      return;
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(0x1f2937, 1);
    graphics.fillRoundedRect(4, 8, 24, 22, 4);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(9, 12, 5, 14);
    graphics.fillRect(9, 12, 14, 4);
    graphics.fillRect(9, 18, 11, 4);
    graphics.lineStyle(3, 0xffca3a, 1);
    graphics.lineBetween(21, 9, 29, 2);
    graphics.fillStyle(0xff7043, 1);
    graphics.fillCircle(29, 2, 3);
    graphics.generateTexture('formula-bomb', 32, 32);
    graphics.destroy();
  }

  private createDoor(key: string, fill: number, glow: number): void {
    if (this.textures.exists(key)) {
      return;
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(fill, 1);
    graphics.fillRect(4, 0, 24, 48);
    graphics.lineStyle(3, glow, 1);
    graphics.strokeRect(5, 2, 22, 44);
    graphics.fillStyle(glow, 1);
    graphics.fillCircle(22, 24, 2);
    graphics.generateTexture(key, 32, 48);
    graphics.destroy();
  }

  private createSpike(): void {
    if (this.textures.exists('spike')) {
      return;
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(0xe11d48, 1);
    graphics.fillTriangle(0, 24, 16, 0, 32, 24);
    graphics.lineStyle(2, 0xffffff, 0.35);
    graphics.strokeTriangle(0, 24, 16, 0, 32, 24);
    graphics.generateTexture('spike', 32, 24);
    graphics.destroy();
  }

  private createSwitch(): void {
    if (this.textures.exists('switch')) {
      return;
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(0x111827, 1);
    graphics.fillRect(4, 18, 24, 8);
    graphics.fillStyle(0xffca3a, 1);
    graphics.fillRect(14, 4, 5, 18);
    graphics.generateTexture('switch', 32, 32);
    graphics.destroy();
  }

  private createMovingPlatform(): void {
    if (this.textures.exists('moving-platform')) {
      return;
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(0xf8fafc, 1);
    graphics.fillRect(0, 0, 96, 18);
    graphics.lineStyle(3, 0x33a7ff, 1);
    graphics.strokeRect(1, 1, 94, 16);
    graphics.generateTexture('moving-platform', 96, 18);
    graphics.destroy();
  }
}
