import Phaser from 'phaser';
import {
  GameEvents,
  type LevelCompletePayload,
  type MathsSuccessPayload,
  type VirtualControl,
  type VirtualControlPayload,
} from '../events';
import { getLevel, type BlockRun, type LevelDefinition } from '../systems/levelRegistry';
import { generateQuestion } from '../systems/questionGenerator';
import type { GameSettings } from '../systems/settingsService';
import type { SceneRunConfig } from './BootScene';

const TILE = 32;
const DEFAULT_WORLD_WIDTH = 1536;
const WORLD_HEIGHT = 512;
const FALL_RESET_Y = WORLD_HEIGHT + 60;
const PHYSICS_WORLD_HEIGHT = FALL_RESET_Y + 180;
const DISAPPEARING_BLOCK_VISIBLE_MS = 2600;
const DISAPPEARING_BLOCK_HIDDEN_MS = 900;

type VirtualControlState = Record<VirtualControl, boolean>;

function createVirtualControlState(): VirtualControlState {
  return {
    left: false,
    right: false,
    jump: false,
    defuse: false,
  };
}

export default class LevelPlayScene extends Phaser.Scene {
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys?: Record<string, Phaser.Input.Keyboard.Key>;
  private player?: Phaser.Physics.Arcade.Sprite;
  private platforms?: Phaser.Physics.Arcade.StaticGroup;
  private hazards?: Phaser.Physics.Arcade.StaticGroup;
  private level?: LevelDefinition;
  private settings?: GameSettings;
  private door?: Phaser.Physics.Arcade.Image;
  private bomb?: Phaser.Physics.Arcade.Image;
  private doorUnlocked = false;
  private questionOpen = false;
  private bridgeRevealed = false;
  private questionsSolved = 0;
  private activeGateId: string | null = null;
  private statusText?: Phaser.GameObjects.Text;
  private bombPromptText?: Phaser.GameObjects.Text;
  private virtualControls = createVirtualControlState();
  private virtualJumpQueued = false;
  private virtualDefuseQueued = false;

  constructor() {
    super('LevelPlayScene');
  }

  init(data: SceneRunConfig): void {
    this.level = getLevel(data.levelId);
    this.settings = data.settings;
    this.doorUnlocked = false;
    this.questionOpen = false;
    this.bridgeRevealed = false;
    this.questionsSolved = 0;
    this.activeGateId = null;
    this.clearVirtualControls();
  }

  create(): void {
    if (!this.level || !this.settings) {
      throw new Error('LevelPlayScene started without level config.');
    }

    const worldWidth = this.getWorldWidth();
    this.physics.world.setBounds(0, 0, worldWidth, PHYSICS_WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, worldWidth, WORLD_HEIGHT);
    this.cameras.main.setBackgroundColor(this.level.background);
    this.game.canvas.setAttribute('tabindex', '0');

    this.addWorldDecoration();
    this.platforms = this.physics.add.staticGroup();
    this.hazards = this.physics.add.staticGroup();
    this.addBlockRuns(this.level.platforms, this.platforms);
    this.addHazards(this.level);

    this.player = this.physics.add.sprite(
      this.level.spawn.x,
      this.level.spawn.y,
      'player',
    );
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.05);
    this.player.body?.setSize(20, 30).setOffset(6, 2);

    this.physics.add.collider(this.player, this.platforms);
    this.addBlockRuns(this.level.crumbleBlocks ?? [], this.platforms, true);
    this.addSwitchBridge(this.level);
    this.addMovingPlatforms(this.level);
    this.addDisappearingBlocks(this.level);
    this.addFallingBlocks(this.level);
    this.addDroppingBombs(this.level);
    this.addSnakePatrols(this.level);
    this.addChaosMode(this.level);

    if (this.hazards) {
      this.physics.add.overlap(this.player, this.hazards, () =>
        this.softReset('That block was spicy. Try again.'),
      );
    }

    this.bomb = this.physics.add.staticImage(
      this.level.bomb.x,
      this.level.bomb.y,
      'formula-bomb',
    );
    this.bomb.setInteractive({ useHandCursor: true });
    this.bomb.on('pointerdown', () => this.openMathsGate());

    this.door = this.physics.add.staticImage(
      this.level.exit.x,
      this.level.exit.y,
      'door-closed',
    );
    this.physics.add.overlap(this.player, this.door, () => this.tryExitLevel());

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.keys = this.input.keyboard?.addKeys('A,D,W,E,SPACE') as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;

    this.statusText = this.add
      .text(16, 16, `${this.level.title} - ${this.level.mathFocus}`, {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#111827cc',
        padding: { x: 10, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(20);

    this.bombPromptText = this.add
      .text(this.level.bomb.x, this.level.bomb.y - 42, 'Press E or tap Defuse', {
        fontFamily: 'Arial',
        fontSize: '15px',
        color: '#ffffff',
        backgroundColor: '#111827dd',
        padding: { x: 8, y: 5 },
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(20);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    GameEvents.removeAllListeners('maths:success');
    GameEvents.on('maths:success', this.handleMathsSuccess);
    GameEvents.off('input:virtual-control', this.handleVirtualControl);
    GameEvents.on('input:virtual-control', this.handleVirtualControl);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.detachGlobalListeners, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.detachGlobalListeners, this);
  }

  update(): void {
    if (!this.player) {
      return;
    }

    if (this.questionOpen) {
      this.player.setVelocityX(0);
      return;
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const left =
      Boolean(this.cursors?.left.isDown || this.keys?.A.isDown) ||
      this.virtualControls.left;
    const right =
      Boolean(this.cursors?.right.isDown || this.keys?.D.isDown) ||
      this.virtualControls.right;
    const jump =
      this.consumeVirtualJump() ||
      Boolean(
        (this.cursors?.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
          (this.keys?.W && Phaser.Input.Keyboard.JustDown(this.keys.W)) ||
          (this.keys?.SPACE && Phaser.Input.Keyboard.JustDown(this.keys.SPACE)),
      );

    if (left) {
      this.player.setVelocityX(-220);
      this.player.setFlipX(true);
    } else if (right) {
      this.player.setVelocityX(220);
      this.player.setFlipX(false);
    } else {
      this.player.setVelocityX(0);
    }

    if (jump && body.blocked.down) {
      this.player.setVelocityY(-455);
    }

    this.updateBombPrompt();

    if (this.player.y > FALL_RESET_Y) {
      this.softReset('Down the gap. Back to the last safe block.');
    }
  }

  private addWorldDecoration(): void {
    const worldWidth = this.getWorldWidth();
    const decorationCount = Math.ceil(worldWidth / 170);

    for (let i = 0; i < decorationCount; i += 1) {
      const x = 130 + i * 170;
      const y = 76 + (i % 3) * 28;
      const size = 22 + (i % 2) * 8;
      this.add
        .rectangle(x, y, size * 2, size, 0xffffff, 0.22)
        .setStrokeStyle(2, 0xffffff, 0.18);
    }

    this.add
      .rectangle(worldWidth / 2, WORLD_HEIGHT - 28, worldWidth, 56, 0x111827, 0.18)
      .setDepth(-1);

  }

  private getWorldWidth(): number {
    return this.level?.worldWidth ?? DEFAULT_WORLD_WIDTH;
  }

  private addBlockRuns(
    runs: BlockRun[],
    group: Phaser.Physics.Arcade.StaticGroup,
    crumble = false,
  ): void {
    for (const run of runs) {
      const texture = run.texture ?? 'grass-block';

      for (let i = 0; i < run.width; i += 1) {
        const block = group
          .create(run.x + i * TILE + TILE / 2, run.y + TILE / 2, texture)
          .setData('crumble', crumble) as Phaser.Physics.Arcade.Sprite;

        block.refreshBody();

        if (crumble && this.player) {
          this.physics.add.overlap(this.player, block, () => {
            this.time.delayedCall(180, () => {
              block.disableBody(true, true);
            });
          });
        }
      }
    }
  }

  private addHazards(level: LevelDefinition): void {
    if (!this.hazards) {
      return;
    }

    for (const hazard of level.hazards ?? []) {
      const count = Math.ceil(hazard.width / TILE);

      for (let i = 0; i < count; i += 1) {
        const spike = this.hazards
          .create(hazard.x + i * TILE + TILE / 2, hazard.y + 12, 'spike')
          .setOrigin(0.5, 0.5) as Phaser.Physics.Arcade.Sprite;
        spike.refreshBody();
      }
    }
  }

  private addFallingBlocks(level: LevelDefinition): void {
    if (!this.player || !this.platforms) {
      return;
    }

    for (const falling of level.fallingBlocks ?? []) {
      const block = this.physics.add.image(falling.x, falling.y, 'crack-block');
      block.setImmovable(false);
      const body = block.body as Phaser.Physics.Arcade.Body;
      body.allowGravity = false;
      block.setData('armed', true);
      this.physics.add.collider(block, this.platforms);
      this.physics.add.overlap(this.player, block, () =>
        this.softReset('Bonk. The Formula Bomb blocks are awake.'),
      );

      this.time.addEvent({
        loop: true,
        delay: 120,
        callback: () => {
          if (!this.player || !block.active || !block.getData('armed')) {
            return;
          }

          if (Math.abs(this.player.x - falling.triggerX) < 72) {
            block.setData('armed', false);
            body.allowGravity = true;
            block.setVelocityY(45);
          }
        },
      });
    }
  }

  private addDroppingBombs(level: LevelDefinition): void {
    if (!this.player || !this.platforms) {
      return;
    }

    for (const dropping of level.droppingBombs ?? []) {
      const bomb = this.physics.add
        .image(dropping.x, dropping.y, 'dropping-bomb')
        .setDepth(9);
      bomb.setImmovable(false);
      bomb.setData('dropped', false);
      bomb.setData('detonated', false);

      const body = bomb.body as Phaser.Physics.Arcade.Body;
      body.allowGravity = false;
      body.setSize(24, 24).setOffset(4, 4);

      this.physics.add.collider(bomb, this.platforms);
      this.physics.add.overlap(this.player, bomb, () =>
        this.detonateDroppingBomb(bomb),
      );

      this.time.addEvent({
        loop: true,
        delay: 120,
        callback: () => {
          if (
            !this.player ||
            !bomb.active ||
            bomb.getData('dropped') ||
            bomb.getData('detonated')
          ) {
            return;
          }

          if (Math.abs(this.player.x - dropping.triggerX) < 78) {
            bomb.setData('dropped', true);
            body.allowGravity = true;
            bomb.setVelocityY(dropping.fallSpeed ?? 58);
            bomb.setAngularVelocity(90);
          }
        },
      });
    }
  }

  private detonateDroppingBomb(bomb: Phaser.Physics.Arcade.Image): void {
    if (bomb.getData('detonated')) {
      return;
    }

    bomb.setData('detonated', true);
    this.showBlast(bomb.x, bomb.y);
    bomb.disableBody(true, true);
    this.softReset('Boom. Watch for dropping bombs.');
  }

  private showBlast(x: number, y: number): void {
    const blast = this.add.image(x, y, 'blast').setDepth(18).setScale(0.45);

    this.tweens.add({
      targets: blast,
      alpha: 0,
      scale: 1.35,
      duration: 280,
      ease: 'Quad.out',
      onComplete: () => blast.destroy(),
    });
  }

  private addSnakePatrols(level: LevelDefinition): void {
    if (!this.player) {
      return;
    }

    for (const patrol of level.snakePatrols ?? []) {
      const snake = this.physics.add
        .sprite(patrol.x, patrol.y, 'snake')
        .setDepth(8);
      snake.setImmovable(true);

      const body = snake.body as Phaser.Physics.Arcade.Body;
      body.allowGravity = false;
      body.setSize(28, 14).setOffset(2, 8);

      this.physics.add.overlap(this.player, snake, () =>
        this.softReset('Snake patrol. Try the timing again.'),
      );

      const distance = Math.max(48, patrol.distance);
      const speed = Math.max(24, patrol.speed ?? 38);
      this.tweens.add({
        targets: snake,
        x: patrol.x + distance,
        duration: (distance / speed) * 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
        onYoyo: () => snake.setFlipX(true),
        onRepeat: () => snake.setFlipX(false),
      });
    }
  }

  private addMovingPlatforms(level: LevelDefinition): void {
    if (!this.player) {
      return;
    }

    for (const moving of level.movingPlatforms ?? []) {
      const platform = this.physics.add.image(
        moving.x,
        moving.y,
        'moving-platform',
      );
      platform.setImmovable(true);
      const body = platform.body as Phaser.Physics.Arcade.Body;
      body.allowGravity = false;
      this.physics.add.collider(this.player, platform);
      this.tweens.add({
        targets: platform,
        x: moving.x + moving.distance,
        duration: 2200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    }
  }

  private addSwitchBridge(level: LevelDefinition): void {
    if (!level.switchBridge || !this.platforms || !this.player) {
      return;
    }

    const switchSprite = this.physics.add.staticImage(390, 320, 'switch');
    const bridgeBlocks: Phaser.Physics.Arcade.Sprite[] = [];

    for (let i = 0; i < level.switchBridge.width; i += 1) {
      const block = this.platforms
        .create(
          level.switchBridge.x + i * TILE + TILE / 2,
          level.switchBridge.y + TILE / 2,
          level.switchBridge.texture ?? 'spark-block',
        )
        .setVisible(false)
        .disableBody(true, true) as Phaser.Physics.Arcade.Sprite;
      bridgeBlocks.push(block);
    }

    this.physics.add.overlap(this.player, switchSprite, () => {
      if (this.bridgeRevealed) {
        return;
      }

      this.bridgeRevealed = true;
      switchSprite.setTint(0x86efac);
      for (const block of bridgeBlocks) {
        block.enableBody(false, block.x, block.y, true, true);
        block.refreshBody();
      }
      this.showToast('Bridge built.');
    });
  }

  private addDisappearingBlocks(level: LevelDefinition): void {
    if (!this.platforms) {
      return;
    }

    const blocks: Phaser.Physics.Arcade.Sprite[] = [];
    const disappearingTextures = new Set(
      (level.disappearingBlocks ?? []).map((run) => run.texture ?? 'grass-block'),
    );
    this.addBlockRuns(level.disappearingBlocks ?? [], this.platforms);

    this.platforms.children.iterate((child) => {
      const block = child as Phaser.Physics.Arcade.Sprite;
      if (disappearingTextures.has(block.texture.key)) {
        blocks.push(block);
      }

      return true;
    });

    if (blocks.length === 0) {
      return;
    }

    const setBlocksActive = (active: boolean): void => {
      for (const block of blocks) {
        if (active) {
          block.enableBody(false, block.x, block.y, true, true);
          block.refreshBody();
        } else {
          block.disableBody(true, true);
        }
      }
    };

    const scheduleNextToggle = (currentlyVisible: boolean): void => {
      this.time.delayedCall(
        currentlyVisible
          ? DISAPPEARING_BLOCK_VISIBLE_MS
          : DISAPPEARING_BLOCK_HIDDEN_MS,
        () => {
          setBlocksActive(!currentlyVisible);
          scheduleNextToggle(!currentlyVisible);
        },
      );
    };

    scheduleNextToggle(true);
  }

  private openMathsGate(): void {
    if (!this.level || !this.settings || this.doorUnlocked || this.questionOpen) {
      return;
    }

    this.questionOpen = true;
    this.questionsSolved = 0;
    const gateId = this.createGateId();
    this.activeGateId = gateId;
    this.player?.setVelocity(0, 0);
    this.clearVirtualControls();
    this.bombPromptText?.setVisible(false);
    this.physics.pause();
    this.showToast('Formula Bomb found.');
    GameEvents.emit('maths:request', {
      gateId,
      levelId: this.level.id,
      question: generateQuestion(
        this.level.questionModes,
        this.settings,
        this.level.mathTier,
      ),
    });
  }

  private handleMathsSuccess = (payload?: MathsSuccessPayload): void => {
    this.unlockDoor(payload);
  };

  private unlockDoor(payload?: MathsSuccessPayload): void {
    if (
      !this.isSceneUsable() ||
      !payload ||
      !this.activeGateId ||
      payload.gateId !== this.activeGateId ||
      !this.door ||
      !this.bomb ||
      !this.level ||
      !this.settings
    ) {
      return;
    }

    this.questionsSolved += 1;

    if (this.questionsSolved < Math.max(1, this.settings.questionsPerLevel)) {
      this.showToast(`Question ${this.questionsSolved + 1}. Keep defusing.`);
      GameEvents.emit('maths:request', {
        gateId: this.activeGateId,
        levelId: this.level.id,
        question: generateQuestion(
          this.level.questionModes,
          this.settings,
          this.level.mathTier,
        ),
      });
      return;
    }

    this.doorUnlocked = true;
    this.questionOpen = false;
    this.activeGateId = null;
    this.door.setTexture('door-open');
    this.bomb.setTint(0x86efac);
    this.resumeGameplay();
    this.showToast('Door unlocked.');
  }

  private resumeGameplay(): void {
    this.physics.resume();
    this.input.keyboard?.resetKeys();
    this.clearVirtualControls();

    if (this.player) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.enable = true;
      body.moves = true;
      body.allowGravity = true;
      this.player.setAcceleration(0, 0);
      this.player.setVelocity(0, 0);
    }

    this.time.delayedCall(0, () => {
      this.physics.resume();
      this.game.canvas.focus();
    });
    this.time.delayedCall(80, () => {
      this.physics.resume();
      this.game.canvas.focus();
    });
  }

  private detachGlobalListeners(): void {
    GameEvents.off('maths:success', this.handleMathsSuccess);
    GameEvents.off('input:virtual-control', this.handleVirtualControl);
    this.clearVirtualControls();
  }

  private handleVirtualControl = (payload?: VirtualControlPayload): void => {
    if (!payload) {
      return;
    }

    this.virtualControls[payload.control] = payload.active;

    if (!payload.active) {
      return;
    }

    if (payload.control === 'jump') {
      this.virtualJumpQueued = true;
    }

    if (payload.control === 'defuse') {
      this.virtualDefuseQueued = true;
    }
  };

  private clearVirtualControls(): void {
    this.virtualControls = createVirtualControlState();
    this.virtualJumpQueued = false;
    this.virtualDefuseQueued = false;
  }

  private consumeVirtualJump(): boolean {
    const queued = this.virtualJumpQueued;
    this.virtualJumpQueued = false;
    return queued;
  }

  private consumeVirtualDefuse(): boolean {
    const queued = this.virtualDefuseQueued;
    this.virtualDefuseQueued = false;
    return queued;
  }

  private isSceneUsable(): boolean {
    return Boolean(
      this.sys?.isActive() &&
        this.door?.scene?.sys &&
        this.bomb?.scene?.sys &&
        this.player?.scene?.sys,
    );
  }

  private createGateId(): string {
    return `${this.level?.id ?? 'level'}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
  }

  private addChaosMode(level: LevelDefinition): void {
    if (!this.settings?.chaosMode || !this.player || !this.platforms) {
      return;
    }

    const surpriseBlock = this.physics.add.image(
      Math.max(845, level.bomb.x - 240),
      128,
      'crack-block',
    );
    surpriseBlock.setData('armed', true);
    surpriseBlock.setImmovable(false);
    const body = surpriseBlock.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    this.physics.add.collider(surpriseBlock, this.platforms);
    this.physics.add.overlap(this.player, surpriseBlock, () =>
      this.softReset('Chaos block says hello.'),
    );

    this.time.addEvent({
      loop: true,
      delay: 120,
      callback: () => {
        if (!this.player || !surpriseBlock.getData('armed')) {
          return;
        }

        if (
          Math.abs(this.player.x - level.bomb.x) < 260 &&
          this.player.x < level.bomb.x
        ) {
          surpriseBlock.setData('armed', false);
          body.allowGravity = true;
          surpriseBlock.setVelocityY(70);
          this.showToast('Chaos block dropped.');
        }
      },
    });
  }

  private tryExitLevel(): void {
    if (!this.level || !this.doorUnlocked) {
      this.showToast('Defuse the Formula Bomb first.');
      return;
    }

    const payload: LevelCompletePayload = { levelId: this.level.id };
    GameEvents.emit('level:complete', payload);
  }

  private softReset(message: string): void {
    if (!this.player || !this.level) {
      return;
    }

    this.showToast(message);
    this.game.canvas.dispatchEvent(
      new CustomEvent('fbomb:soft-reset', {
        detail: {
          levelId: this.level.id,
          message,
        },
      }),
    );
    this.clearVirtualControls();
    this.player.setVelocity(0, 0);
    this.player.setPosition(this.level.spawn.x, this.level.spawn.y);
  }

  private showToast(message: string): void {
    this.statusText?.setText(message);
    this.time.delayedCall(1600, () => {
      if (this.statusText && this.level) {
        this.statusText.setText(`${this.level.title} - ${this.level.mathFocus}`);
      }
    });
  }

  private updateBombPrompt(): void {
    if (!this.player || !this.bomb || !this.bombPromptText || this.doorUnlocked) {
      this.bombPromptText?.setVisible(false);
      return;
    }

    const nearBomb =
      Math.abs(this.player.x - this.bomb.x) < 58 &&
      Math.abs(this.player.y - this.bomb.y) < 70;

    this.bombPromptText.setVisible(nearBomb);

    const defuseRequested =
      this.consumeVirtualDefuse() ||
      Boolean(this.keys?.E && Phaser.Input.Keyboard.JustDown(this.keys.E));

    if (nearBomb && defuseRequested) {
      this.openMathsGate();
    }
  }
}
