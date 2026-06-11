import type { QuestionMode } from './questionGenerator';
import type { Reward } from './rewardService';

const TILE = 32;

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

export type DroppingBomb = {
  x: number;
  y: number;
  triggerX: number;
  fallSpeed?: number;
};

export type MovingPlatform = {
  x: number;
  y: number;
  distance: number;
};

export type SnakePatrol = {
  x: number;
  y: number;
  distance: number;
  speed?: number;
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
  droppingBombs?: DroppingBomb[];
  snakePatrols?: SnakePatrol[];
  movingPlatforms?: MovingPlatform[];
  crumbleBlocks?: BlockRun[];
  disappearingBlocks?: BlockRun[];
  switchBridge?: BlockRun;
  worldWidth?: number;
};

const baseLevels: LevelDefinition[] = [
  {
    id: 'level-1',
    title: 'Grass Blocks',
    theme: 'Sunny block meadow',
    mechanic: 'Basic movement and one dropping bomb',
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
    droppingBombs: [{ x: 384, y: 160, triggerX: 330, fallSpeed: 48 }],
  },
  {
    id: 'level-2',
    title: 'Cave Run',
    theme: 'Lantern cave',
    mechanic: 'Low ledge before the first snake',
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
    snakePatrols: [{ x: 760, y: 432, distance: 120, speed: 34 }],
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
      { x: 330, y: 360, width: 4, texture: 'crystal-block' },
      { x: 920, y: 304, width: 5, texture: 'crystal-block' },
    ],
    movingPlatforms: [{ x: 560, y: 356, distance: 170 }],
    hazards: [{ x: 420, y: 432, width: 320 }],
    snakePatrols: [{ x: 930, y: 432, distance: 150, speed: 36 }],
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
    droppingBombs: [{ x: 720, y: 132, triggerX: 650, fallSpeed: 54 }],
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
    snakePatrols: [{ x: 900, y: 368, distance: 82, speed: 34 }],
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
    snakePatrols: [{ x: 1040, y: 304, distance: 84, speed: 36 }],
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
    droppingBombs: [{ x: 835, y: 132, triggerX: 760, fallSpeed: 58 }],
    snakePatrols: [{ x: 960, y: 304, distance: 92, speed: 38 }],
  },
  {
    id: 'level-8',
    title: 'Prism Steps',
    theme: 'Glass prism block arrays',
    mechanic: 'Dropping bombs around stepped arrays',
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
    droppingBombs: [
      { x: 374, y: 120, triggerX: 310, fallSpeed: 58 },
      { x: 690, y: 128, triggerX: 635, fallSpeed: 58 },
    ],
    hazards: [{ x: 500, y: 432, width: 220 }],
    snakePatrols: [{ x: 820, y: 368, distance: 74, speed: 38 }],
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
    droppingBombs: [{ x: 900, y: 120, triggerX: 820, fallSpeed: 62 }],
    snakePatrols: [{ x: 1000, y: 304, distance: 92, speed: 40 }],
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
    droppingBombs: [
      { x: 370, y: 120, triggerX: 300, fallSpeed: 64 },
      { x: 1210, y: 128, triggerX: 1120, fallSpeed: 64 },
    ],
    hazards: [
      { x: 330, y: 432, width: 180 },
      { x: 680, y: 432, width: 100 },
    ],
    snakePatrols: [
      { x: 920, y: 336, distance: 70, speed: 40 },
      { x: 1080, y: 272, distance: 86, speed: 42 },
    ],
  },
];

type GeneratedTheme = {
  name: string;
  theme: string;
  texture: string;
  background: string;
  accent: string;
  rewardNoun: string;
};

type MathProfile = {
  focus: string;
  modes: QuestionMode[];
};

const generatedThemes: GeneratedTheme[] = [
  {
    name: 'Meadow',
    theme: 'Open grass causeway',
    texture: 'grass-block',
    background: '#80cde7',
    accent: '#2f9e44',
    rewardNoun: 'meadow coin',
  },
  {
    name: 'Granite',
    theme: 'Deep stone passage',
    texture: 'stone-block',
    background: '#475569',
    accent: '#cbd5e1',
    rewardNoun: 'granite chip',
  },
  {
    name: 'Crystal',
    theme: 'Bright crystal climb',
    texture: 'crystal-block',
    background: '#164e63',
    accent: '#22d3ee',
    rewardNoun: 'crystal spark',
  },
  {
    name: 'Clockwork',
    theme: 'Copper machine run',
    texture: 'gear-block',
    background: '#5b4636',
    accent: '#f59e0b',
    rewardNoun: 'clockwork cog',
  },
  {
    name: 'Prism',
    theme: 'Glass prism bridges',
    texture: 'prism-block',
    background: '#3730a3',
    accent: '#c4b5fd',
    rewardNoun: 'prism shard',
  },
  {
    name: 'Forge',
    theme: 'Molten forge crossing',
    texture: 'forge-block',
    background: '#451a03',
    accent: '#fb923c',
    rewardNoun: 'forge ember',
  },
  {
    name: 'Skyline',
    theme: 'Windy sky platforms',
    texture: 'sky-block',
    background: '#7dd3fc',
    accent: '#2563eb',
    rewardNoun: 'sky token',
  },
  {
    name: 'Core',
    theme: 'Red bomb core route',
    texture: 'core-block',
    background: '#111827',
    accent: '#ef4444',
    rewardNoun: 'core badge',
  },
];

const GAP_HAZARD_LANDING_CLEARANCE = 96;

function getMathProfile(levelNumber: number): MathProfile {
  if (levelNumber <= 20) {
    return {
      focus: 'Number fluency and simple fractions',
      modes:
        levelNumber < 16
          ? ['addition', 'subtraction', 'multiplication', 'sequence']
          : ['addition', 'subtraction', 'multiplication', 'fraction', 'sequence'],
    };
  }

  if (levelNumber <= 30) {
    return {
      focus: 'Clock arithmetic and fraction starts',
      modes: ['time', 'fraction', 'addition', 'subtraction', 'missing-number'],
    };
  }

  if (levelNumber <= 40) {
    return {
      focus: 'Division, mixed fractions and two-step maths',
      modes: ['division', 'multiplication', 'fraction', 'time', 'two-step'],
    };
  }

  if (levelNumber <= 50) {
    return {
      focus: 'Squares, arrays and two-step puzzles',
      modes: ['power', 'geometry', 'multiplication', 'two-step'],
    };
  }

  if (levelNumber <= 60) {
    return {
      focus: 'Fractions, time and powers',
      modes: ['fraction', 'time', 'power', 'two-step', 'mixed'],
    };
  }

  if (levelNumber <= 70) {
    return {
      focus: 'Square roots and powers',
      modes: ['root', 'power', 'multiplication', 'division'],
    };
  }

  if (levelNumber <= 80) {
    return {
      focus: 'Cubes and tougher roots',
      modes: ['power', 'root', 'two-step', 'mixed'],
    };
  }

  if (levelNumber <= 90) {
    return {
      focus: 'Cube roots, fractions and time',
      modes: ['root', 'power', 'time', 'fraction', 'two-step'],
    };
  }

  return {
    focus: 'Expert mixed defuse',
    modes: ['mixed', 'root', 'power', 'time', 'fraction'],
  };
}

function getMechanicSummary(stage: number): string {
  const summaries = [
    'Longer jumps with a gentle snake patrol',
    'Spike gaps with dropping bombs',
    'Moving lifts across split ground',
    'Crumbling steps with snake patrols',
    'Disappearing blocks over hazards',
    'Switch bridge with moving lifts',
    'Layered lifts, snakes and crumble routes',
    'Fast blocks and dropping bomb timing',
    'Long expert route with every trap type',
  ];

  return summaries[Math.min(stage, summaries.length - 1)];
}

function createGeneratedLevel(levelNumber: number): LevelDefinition {
  const generatedIndex = levelNumber - 10;
  const stage = Math.floor((generatedIndex - 1) / 10);
  const localIndex = ((generatedIndex - 1) % 10) + 1;
  const theme =
    generatedThemes[(levelNumber + stage) % generatedThemes.length] ??
    generatedThemes[0];
  const mathProfile = getMathProfile(levelNumber);
  const worldWidth = 1536 + stage * 220 + Math.floor((localIndex - 1) / 2) * 64;
  const platformTexture = theme.texture;
  const bombX = worldWidth - 440;
  const exitX = worldWidth - 150;
  const platforms: BlockRun[] = [
    { x: 0, y: 448, width: 12, texture: platformTexture },
    {
      x: worldWidth - 384,
      y: 448,
      width: 12 + Math.min(4, Math.floor(stage / 2)),
      texture: platformTexture,
    },
    { x: bombX - 172, y: 384, width: 4, texture: platformTexture },
    { x: bombX - 84, y: 320, width: 6, texture: platformTexture },
  ];
  const hazards: Hazard[] = [];
  const droppingBombs: DroppingBomb[] = [];
  const snakePatrols: SnakePatrol[] = [];
  const movingPlatforms: MovingPlatform[] = [];
  const crumbleBlocks: BlockRun[] = [];
  const disappearingBlocks: BlockRun[] = [];
  const maxDroppingBombs = Math.min(4, 1 + Math.floor((stage + localIndex) / 4));
  const maxSnakePatrols = Math.min(5, 1 + Math.floor((stage + localIndex) / 3));
  let cursor = 384;
  let segmentIndex = 0;

  while (cursor < worldWidth - 500) {
    const generatedGap = Math.min(
      176,
      96 + ((levelNumber + segmentIndex) % 3) * 32 + Math.floor(stage / 5) * 16,
    );
    const gap = segmentIndex === 0 ? Math.min(generatedGap, 96) : generatedGap;
    const segmentX = cursor + gap;
    const segmentWidth =
      6 + ((levelNumber + segmentIndex) % 4) + Math.floor(stage / 4);
    const platformY = 448 - ((segmentIndex + stage) % 2) * 24;
    const midGapX = cursor + Math.floor(gap / 2) - 32;
    const upperY = 360 - ((segmentIndex + stage) % 3) * 24;

    platforms.push({
      x: segmentX,
      y: platformY,
      width: segmentWidth,
      texture: platformTexture,
    });

    platforms.push({
      x: midGapX,
      y: upperY,
      width: 3 + ((localIndex + segmentIndex) % 2),
      texture: platformTexture,
    });

    if ((segmentIndex + stage) % 2 === 0) {
      hazards.push({
        x: cursor + 16,
        y: 432,
        width: Math.max(TILE, gap - GAP_HAZARD_LANDING_CLEARANCE),
      });
    }

    if (stage >= 1 && segmentIndex % 3 === 1) {
      hazards.push({
        x: segmentX + 64,
        y: platformY - 16,
        width: 64 + (stage % 2) * 32,
      });
    }

    if (
      (stage >= 1 || localIndex >= 5) &&
      segmentIndex > 0 &&
      segmentIndex % 4 === 0 &&
      droppingBombs.length < maxDroppingBombs
    ) {
      droppingBombs.push({
        x: segmentX + 80,
        y: 120 + (segmentIndex % 2) * 24,
        triggerX: segmentX - 20,
        fallSpeed: 54 + Math.min(26, stage * 4),
      });
    }

    if (
      (localIndex >= 3 || stage >= 1) &&
      segmentIndex % 4 === 1 &&
      snakePatrols.length < maxSnakePatrols
    ) {
      snakePatrols.push({
        x: segmentX + 48,
        y: platformY - 16,
        distance: Math.max(56, Math.min(150, segmentWidth * 32 - 84)),
        speed: 32 + Math.min(18, stage * 2),
      });
    }

    if (stage >= 2 && segmentIndex % 4 === 2 && movingPlatforms.length < 3) {
      movingPlatforms.push({
        x: midGapX + 24,
        y: 356 - (stage % 2) * 24,
        distance: 120 + (localIndex % 3) * 24,
      });
    }

    if (stage >= 3 && segmentIndex % 3 === 2 && crumbleBlocks.length < 4) {
      crumbleBlocks.push({
        x: segmentX + 32,
        y: platformY - 96,
        width: 2 + (stage % 2),
        texture: 'crack-block',
      });
    }

    if (stage >= 4 && segmentIndex % 4 === 1 && disappearingBlocks.length < 4) {
      disappearingBlocks.push({
        x: midGapX + 8,
        y: upperY - 48,
        width: 3,
        texture: localIndex % 2 === 0 ? 'hot-block' : 'fraction-block',
      });
    }

    cursor = segmentX + segmentWidth * 32;
    segmentIndex += 1;
  }

  const switchBridge =
    stage >= 5 && localIndex % 3 === 0
      ? {
          x: 520 + stage * 24,
          y: 352,
          width: 5 + Math.min(4, stage - 4),
          texture: 'gear-bridge-block',
        }
      : undefined;

  if (switchBridge) {
    platforms.push({ x: 320, y: 352, width: 4, texture: platformTexture });
    hazards.push({ x: switchBridge.x, y: 432, width: switchBridge.width * 32 });
  }

  return {
    id: `level-${levelNumber}`,
    title: `${theme.name} Run ${levelNumber}`,
    theme: theme.theme,
    mechanic: getMechanicSummary(stage),
    mathFocus: mathProfile.focus,
    mathTier: levelNumber,
    questionModes: mathProfile.modes,
    reward: {
      id: `level-${levelNumber}-reward`,
      label: `${theme.rewardNoun} ${localIndex}`,
      color: theme.accent,
    },
    background: theme.background,
    accent: theme.accent,
    spawn: { x: 90, y: 360 },
    bomb: { x: bombX, y: 292 },
    exit: { x: exitX, y: 352 },
    platforms,
    hazards,
    droppingBombs,
    snakePatrols,
    movingPlatforms,
    crumbleBlocks,
    disappearingBlocks,
    switchBridge,
    worldWidth,
  };
}

const generatedLevels = Array.from({ length: 90 }, (_, index) =>
  createGeneratedLevel(index + 11),
);

export const levels: LevelDefinition[] = [...baseLevels, ...generatedLevels];

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
