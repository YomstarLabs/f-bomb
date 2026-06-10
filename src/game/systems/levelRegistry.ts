import type { QuestionMode } from './questionGenerator';
import type { Reward } from './rewardService';

export type Point = {
  x: number;
  y: number;
};

export type BlockRun = {
  x: number;
  y: number;
  width: number;
  texture?: string;
};

export type Hazard = {
  x: number;
  y: number;
  width: number;
};

export type FallingBlock = {
  x: number;
  y: number;
  triggerX: number;
};

export type MovingPlatform = {
  x: number;
  y: number;
  distance: number;
};

export type LevelDefinition = {
  id: string;
  title: string;
  theme: string;
  mechanic: string;
  mathFocus: string;
  mathTier: number;
  questionModes: QuestionMode[];
  reward: Reward;
  background: string;
  accent: string;
  spawn: Point;
  bomb: Point;
  exit: Point;
  platforms: BlockRun[];
  hazards?: Hazard[];
  fallingBlocks?: FallingBlock[];
  movingPlatforms?: MovingPlatform[];
  crumbleBlocks?: BlockRun[];
  disappearingBlocks?: BlockRun[];
  switchBridge?: BlockRun;
};

export const levels: LevelDefinition[] = [
  {
    id: 'level-1',
    title: 'Grass Blocks',
    theme: 'Sunny block meadow',
    mechanic: 'Basic movement and one falling block',
    mathFocus: 'Addition under 20',
    mathTier: 1,
    questionModes: ['addition'],
    reward: {
      id: 'grass-block-badge',
      label: 'Grass block badge',
      color: '#49a84f',
    },
    background: '#91d8f7',
    accent: '#3c8f45',
    spawn: { x: 90, y: 360 },
    bomb: { x: 1040, y: 372 },
    exit: { x: 1370, y: 352 },
    platforms: [
      { x: 0, y: 448, width: 48, texture: 'grass-block' },
      { x: 250, y: 352, width: 4, texture: 'grass-block' },
      { x: 478, y: 304, width: 4, texture: 'grass-block' },
      { x: 724, y: 368, width: 4, texture: 'grass-block' },
      { x: 1130, y: 352, width: 3, texture: 'grass-block' },
    ],
    hazards: [{ x: 610, y: 432, width: 96 }],
    fallingBlocks: [{ x: 384, y: 160, triggerX: 330 }],
  },
  {
    id: 'level-2',
    title: 'Cave Run',
    theme: 'Lantern cave',
    mechanic: 'Low ledge before cracked floor',
    mathFocus: 'Subtraction under 20',
    mathTier: 2,
    questionModes: ['subtraction'],
    reward: {
      id: 'stone-block-badge',
      label: 'Stone block badge',
      color: '#8b95a1',
    },
    background: '#405168',
    accent: '#b7c0cb',
    spawn: { x: 90, y: 360 },
    bomb: { x: 1040, y: 276 },
    exit: { x: 1370, y: 352 },
    platforms: [
      { x: 0, y: 448, width: 12, texture: 'stone-block' },
      { x: 640, y: 448, width: 28, texture: 'stone-block' },
      { x: 270, y: 368, width: 5, texture: 'stone-block' },
      { x: 500, y: 336, width: 4, texture: 'stone-block' },
      { x: 720, y: 336, width: 4, texture: 'stone-block' },
      { x: 920, y: 304, width: 5, texture: 'stone-block' },
    ],
    crumbleBlocks: [{ x: 384, y: 448, width: 2, texture: 'crack-block' }],
    hazards: [{ x: 480, y: 432, width: 128 }],
  },
  {
    id: 'level-3',
    title: 'Crystal Mine',
    theme: 'Blue crystal shafts',
    mechanic: 'Moving platform',
    mathFocus: '2x, 5x and 10x tables',
    mathTier: 3,
    questionModes: ['multiplication'],
    reward: {
      id: 'blue-crystal',
      label: 'Blue crystal',
      color: '#33a7ff',
    },
    background: '#173f5f',
    accent: '#49d3ff',
    spawn: { x: 90, y: 360 },
    bomb: { x: 1030, y: 244 },
    exit: { x: 1370, y: 352 },
    platforms: [
      { x: 0, y: 448, width: 12, texture: 'crystal-block' },
      { x: 800, y: 448, width: 24, texture: 'crystal-block' },
      { x: 330, y: 336, width: 4, texture: 'crystal-block' },
      { x: 920, y: 272, width: 5, texture: 'crystal-block' },
    ],
    movingPlatforms: [{ x: 560, y: 356, distance: 170 }],
    hazards: [{ x: 420, y: 432, width: 320 }],
  },
  {
    id: 'level-4',
    title: 'Sparkstone Lab',
    theme: 'Switches and sparkstone',
    mechanic: 'Switch reveals the bridge',
    mathFocus: 'Number patterns',
    mathTier: 4,
    questionModes: ['sequence'],
    reward: {
      id: 'sparkstone-dust',
      label: 'Sparkstone dust',
      color: '#ffca3a',
    },
    background: '#293241',
    accent: '#ffca3a',
    spawn: { x: 90, y: 360 },
    bomb: { x: 980, y: 292 },
    exit: { x: 1320, y: 352 },
    platforms: [
      { x: 0, y: 448, width: 16, texture: 'lab-block' },
      { x: 780, y: 448, width: 26, texture: 'lab-block' },
      { x: 320, y: 352, width: 4, texture: 'lab-block' },
      { x: 760, y: 384, width: 4, texture: 'lab-block' },
      { x: 880, y: 320, width: 5, texture: 'lab-block' },
    ],
    switchBridge: { x: 520, y: 352, width: 6, texture: 'spark-block' },
    hazards: [{ x: 520, y: 432, width: 220 }],
  },
  {
    id: 'level-5',
    title: 'Lava Room',
    theme: 'Hot block chamber',
    mechanic: 'Timed jumps and disappearing blocks',
    mathFocus: 'Mixed arithmetic',
    mathTier: 5,
    questionModes: ['addition', 'subtraction', 'multiplication', 'sequence'],
    reward: {
      id: 'lava-shield',
      label: 'Lava shield',
      color: '#ff7043',
    },
    background: '#3b1f2b',
    accent: '#ff7043',
    spawn: { x: 90, y: 360 },
    bomb: { x: 1060, y: 308 },
    exit: { x: 1370, y: 352 },
    platforms: [
      { x: 0, y: 448, width: 11, texture: 'lava-block' },
      { x: 760, y: 448, width: 26, texture: 'lava-block' },
      { x: 310, y: 352, width: 3, texture: 'lava-block' },
      { x: 840, y: 384, width: 4, texture: 'lava-block' },
      { x: 980, y: 336, width: 5, texture: 'lava-block' },
    ],
    disappearingBlocks: [
      { x: 455, y: 360, width: 3, texture: 'hot-block' },
      { x: 600, y: 320, width: 3, texture: 'hot-block' },
    ],
    hazards: [{ x: 360, y: 432, width: 360 }],
  },
  {
    id: 'level-6',
    title: 'Sky Lift',
    theme: 'Windy cloud platforms',
    mechanic: 'Moving lifts over a wide gap',
    mathFocus: 'Multiplication and division',
    mathTier: 6,
    questionModes: ['multiplication', 'division'],
    reward: {
      id: 'sky-lift-token',
      label: 'Sky lift token',
      color: '#38bdf8',
    },
    background: '#8ed7ff',
    accent: '#2563eb',
    spawn: { x: 90, y: 360 },
    bomb: { x: 1080, y: 284 },
    exit: { x: 1370, y: 352 },
    platforms: [
      { x: 0, y: 448, width: 10, texture: 'sky-block' },
      { x: 820, y: 448, width: 24, texture: 'sky-block' },
      { x: 260, y: 360, width: 4, texture: 'sky-block' },
      { x: 900, y: 352, width: 4, texture: 'sky-block' },
      { x: 1040, y: 320, width: 5, texture: 'sky-block' },
    ],
    movingPlatforms: [
      { x: 530, y: 360, distance: 170 },
      { x: 1180, y: 316, distance: 120 },
    ],
    hazards: [{ x: 352, y: 432, width: 420 }],
  },
  {
    id: 'level-7',
    title: 'Gearbox Works',
    theme: 'Copper gears and bridge switches',
    mechanic: 'Switch bridge with crumbling steps',
    mathFocus: 'Missing number equations',
    mathTier: 7,
    questionModes: ['missing-number', 'addition', 'subtraction'],
    reward: {
      id: 'gearbox-key',
      label: 'Gearbox key',
      color: '#d97706',
    },
    background: '#4b5563',
    accent: '#f59e0b',
    spawn: { x: 90, y: 360 },
    bomb: { x: 990, y: 292 },
    exit: { x: 1330, y: 352 },
    platforms: [
      { x: 0, y: 448, width: 16, texture: 'gear-block' },
      { x: 780, y: 448, width: 26, texture: 'gear-block' },
      { x: 320, y: 352, width: 4, texture: 'gear-block' },
      { x: 790, y: 384, width: 4, texture: 'gear-block' },
      { x: 900, y: 320, width: 5, texture: 'gear-block' },
    ],
    switchBridge: { x: 520, y: 352, width: 6, texture: 'gear-bridge-block' },
    crumbleBlocks: [{ x: 690, y: 352, width: 2, texture: 'crack-block' }],
    hazards: [{ x: 520, y: 432, width: 220 }],
  },
  {
    id: 'level-8',
    title: 'Prism Steps',
    theme: 'Glass prism block arrays',
    mechanic: 'Falling blocks around stepped arrays',
    mathFocus: 'Arrays and block geometry',
    mathTier: 8,
    questionModes: ['geometry', 'multiplication'],
    reward: {
      id: 'prism-shard',
      label: 'Prism shard',
      color: '#a78bfa',
    },
    background: '#312e81',
    accent: '#a78bfa',
    spawn: { x: 90, y: 360 },
    bomb: { x: 1070, y: 276 },
    exit: { x: 1370, y: 352 },
    platforms: [
      { x: 0, y: 448, width: 12, texture: 'prism-block' },
      { x: 760, y: 448, width: 26, texture: 'prism-block' },
      { x: 270, y: 368, width: 3, texture: 'prism-block' },
      { x: 420, y: 328, width: 4, texture: 'prism-block' },
      { x: 620, y: 360, width: 3, texture: 'prism-block' },
      { x: 810, y: 384, width: 3, texture: 'prism-block' },
      { x: 900, y: 344, width: 3, texture: 'prism-block' },
      { x: 930, y: 304, width: 5, texture: 'prism-block' },
    ],
    fallingBlocks: [
      { x: 374, y: 120, triggerX: 310 },
      { x: 690, y: 128, triggerX: 635 },
    ],
    hazards: [{ x: 500, y: 432, width: 220 }],
  },
  {
    id: 'level-9',
    title: 'Fraction Forge',
    theme: 'Molten forge and split blocks',
    mechanic: 'Tighter disappearing block timing',
    mathFocus: 'Halves, quarters and division',
    mathTier: 9,
    questionModes: ['fraction', 'division', 'multiplication'],
    reward: {
      id: 'fraction-forge-ingot',
      label: 'Fraction forge ingot',
      color: '#f97316',
    },
    background: '#431407',
    accent: '#fb923c',
    spawn: { x: 90, y: 360 },
    bomb: { x: 1060, y: 292 },
    exit: { x: 1370, y: 352 },
    platforms: [
      { x: 0, y: 448, width: 11, texture: 'forge-block' },
      { x: 780, y: 448, width: 26, texture: 'forge-block' },
      { x: 300, y: 360, width: 3, texture: 'forge-block' },
      { x: 840, y: 384, width: 4, texture: 'forge-block' },
      { x: 980, y: 320, width: 5, texture: 'forge-block' },
    ],
    disappearingBlocks: [
      { x: 450, y: 360, width: 3, texture: 'fraction-block' },
      { x: 590, y: 320, width: 3, texture: 'fraction-block' },
      { x: 710, y: 368, width: 2, texture: 'fraction-block' },
    ],
    hazards: [{ x: 360, y: 432, width: 380 }],
  },
  {
    id: 'level-10',
    title: 'Bomb Core',
    theme: 'Final core chamber',
    mechanic: 'Every trap type in one short run',
    mathFocus: 'Mixed two-step challenge',
    mathTier: 10,
    questionModes: ['two-step', 'mixed'],
    reward: {
      id: 'bomb-core-crown',
      label: 'Bomb core crown',
      color: '#ef4444',
    },
    background: '#111827',
    accent: '#ef4444',
    spawn: { x: 90, y: 360 },
    bomb: { x: 1080, y: 252 },
    exit: { x: 1380, y: 352 },
    platforms: [
      { x: 0, y: 448, width: 10, texture: 'core-block' },
      { x: 820, y: 448, width: 24, texture: 'core-block' },
      { x: 260, y: 360, width: 3, texture: 'core-block' },
      { x: 430, y: 328, width: 3, texture: 'core-block' },
      { x: 900, y: 352, width: 3, texture: 'core-block' },
      { x: 1020, y: 288, width: 5, texture: 'core-block' },
    ],
    movingPlatforms: [{ x: 600, y: 356, distance: 170 }],
    disappearingBlocks: [{ x: 720, y: 336, width: 3, texture: 'spark-block' }],
    fallingBlocks: [
      { x: 370, y: 120, triggerX: 300 },
      { x: 1210, y: 128, triggerX: 1120 },
    ],
    hazards: [
      { x: 330, y: 432, width: 180 },
      { x: 680, y: 432, width: 100 },
    ],
  },
];

export function getLevel(levelId: string): LevelDefinition {
  return levels.find((level) => level.id === levelId) ?? levels[0];
}

export function getNextLevelId(levelId: string): string | null {
  const index = levels.findIndex((level) => level.id === levelId);
  return levels[index + 1]?.id ?? null;
}

export function isLevelUnlocked(
  levelId: string,
  completedLevels: string[],
): boolean {
  const index = levels.findIndex((level) => level.id === levelId);

  if (index <= 0) {
    return true;
  }

  return completedLevels.includes(levels[index - 1].id);
}
