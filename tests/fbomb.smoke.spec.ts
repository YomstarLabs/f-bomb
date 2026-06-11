import { expect, test } from '@playwright/test';
import {
  levels,
  type BlockRun,
  type LevelDefinition,
  type MovingPlatform,
  type Point,
} from '../src/game/systems/levelRegistry';

const TILE = 32;
const PLAYER_SPEED = 220;
const JUMP_VELOCITY = 455;
const GRAVITY = 920;
const PLAYER_BODY_WIDTH = 20;
const PLAYER_BODY_HEIGHT = 30;
const PLATFORM_EDGE_MARGIN = 6;
const JUMP_SAFETY_MARGIN = 12;
const MAX_JUMP_HEIGHT = (JUMP_VELOCITY * JUMP_VELOCITY) / (2 * GRAVITY);
const MAX_TARGET_STEP_UP = MAX_JUMP_HEIGHT - 8;
const SWITCH_POSITION: Point = { x: 390, y: 320 };

type Surface = {
  id: string;
  x: number;
  endX: number;
  y: number;
};

function runEnd(run: BlockRun): number {
  return run.x + run.width * TILE;
}

function surfaceFromRun(run: BlockRun, id: string): Surface {
  return {
    id,
    x: run.x,
    endX: runEnd(run),
    y: run.y,
  };
}

function surfaceFromMovingPlatform(
  platform: MovingPlatform,
  id: string,
): Surface {
  return {
    id,
    x: platform.x - 48,
    endX: platform.x + platform.distance + 48,
    y: platform.y - 9,
  };
}

function getStandableRange(surface: Surface): { x: number; endX: number } {
  return {
    x: Math.min(
      surface.x + PLATFORM_EDGE_MARGIN,
      (surface.x + surface.endX) / 2,
    ),
    endX: Math.max(
      surface.endX - PLATFORM_EDGE_MARGIN,
      (surface.x + surface.endX) / 2,
    ),
  };
}

function horizontalGap(from: Surface, to: Surface): number {
  const fromRange = getStandableRange(from);
  const toRange = getStandableRange(to);

  return Math.max(toRange.x - fromRange.endX, fromRange.x - toRange.endX, 0);
}

function splitSurfaceAroundHazards(
  surface: Surface,
  level: LevelDefinition,
): Surface[] {
  const blockingHazards = (level.hazards ?? [])
    .filter(
      (hazard) =>
        hazard.y <= surface.y &&
        hazard.y + 24 >= surface.y - 4 &&
        hazard.x < surface.endX &&
        hazard.x + hazard.width > surface.x,
    )
    .map((hazard) => ({
      x: Math.max(surface.x, hazard.x),
      endX: Math.min(surface.endX, hazard.x + hazard.width),
    }))
    .sort((a, b) => a.x - b.x);

  if (blockingHazards.length === 0) {
    return [surface];
  }

  const pieces: Surface[] = [];
  let cursor = surface.x;

  for (const hazard of blockingHazards) {
    if (hazard.x - cursor >= PLAYER_BODY_WIDTH) {
      pieces.push({
        ...surface,
        id: `${surface.id}:safe-${pieces.length}`,
        x: cursor,
        endX: hazard.x,
      });
    }

    cursor = Math.max(cursor, hazard.endX);
  }

  if (surface.endX - cursor >= PLAYER_BODY_WIDTH) {
    pieces.push({
      ...surface,
      id: `${surface.id}:safe-${pieces.length}`,
      x: cursor,
      endX: surface.endX,
    });
  }

  return pieces;
}

function createSurfaces(
  level: LevelDefinition,
  includeSwitchBridge: boolean,
): Surface[] {
  const runs = [
    ...level.platforms,
    ...(level.crumbleBlocks ?? []),
    ...(level.disappearingBlocks ?? []),
    ...(includeSwitchBridge && level.switchBridge ? [level.switchBridge] : []),
  ];
  const fixedSurfaces = runs.flatMap((run, index) =>
    splitSurfaceAroundHazards(surfaceFromRun(run, `run-${index}`), level),
  );
  const movingSurfaces = (level.movingPlatforms ?? []).map((platform, index) =>
    surfaceFromMovingPlatform(platform, `moving-${index}`),
  );

  return [...fixedSurfaces, ...movingSurfaces];
}

function jumpFlightTime(verticalDelta: number): number | null {
  if (verticalDelta < -MAX_TARGET_STEP_UP) {
    return null;
  }

  const discriminant =
    JUMP_VELOCITY * JUMP_VELOCITY + 2 * GRAVITY * verticalDelta;

  if (discriminant < 0) {
    return null;
  }

  return (JUMP_VELOCITY + Math.sqrt(discriminant)) / GRAVITY;
}

function canReachSurface(from: Surface, to: Surface): boolean {
  if (from.id === to.id) {
    return false;
  }

  const flightTime = jumpFlightTime(to.y - from.y);

  if (flightTime === null) {
    return false;
  }

  const reachableDistance = PLAYER_SPEED * flightTime - JUMP_SAFETY_MARGIN;

  return horizontalGap(from, to) <= reachableDistance;
}

function findSpawnSurface(
  level: LevelDefinition,
  surfaces: Surface[],
): Surface | null {
  const candidates = surfaces
    .filter((surface) => {
      const range = getStandableRange(surface);

      return (
        level.spawn.x >= range.x &&
        level.spawn.x <= range.endX &&
        surface.y >= level.spawn.y
      );
    })
    .sort((a, b) => a.y - b.y);

  return candidates[0] ?? null;
}

function findReachableSurfaces(
  start: Surface,
  surfaces: Surface[],
): Set<Surface> {
  const reachable = new Set<Surface>([start]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      continue;
    }

    for (const candidate of surfaces) {
      if (reachable.has(candidate) || !canReachSurface(current, candidate)) {
        continue;
      }

      reachable.add(candidate);
      queue.push(candidate);
    }
  }

  return reachable;
}

function hasReachableSwitch(reachable: Set<Surface>): boolean {
  return [...reachable].some((surface) => {
    const range = getStandableRange(surface);
    const horizontalOverlap =
      range.x <= SWITCH_POSITION.x + 16 && range.endX >= SWITCH_POSITION.x - 16;
    const playerTop = surface.y - PLAYER_BODY_HEIGHT;
    const playerBottom = surface.y;
    const switchTop = SWITCH_POSITION.y - 16;
    const switchBottom = SWITCH_POSITION.y + 16;

    return (
      horizontalOverlap &&
      playerTop < switchBottom &&
      playerBottom > switchTop
    );
  });
}

function canDefuseBomb(surface: Surface, bomb: Point): boolean {
  const range = getStandableRange(surface);
  const playerY = surface.y - 16;

  return (
    range.x <= bomb.x + 58 &&
    range.endX >= bomb.x - 58 &&
    Math.abs(playerY - bomb.y) < 70
  );
}

function canEnterExit(surface: Surface, exit: Point): boolean {
  const range = getStandableRange(surface);
  const horizontalOverlap = range.x <= exit.x + 48 && range.endX >= exit.x - 48;
  const jumpTop = surface.y - MAX_JUMP_HEIGHT;
  const exitTop = exit.y - 24;
  const exitBottom = exit.y + 24;

  return horizontalOverlap && jumpTop <= exitBottom && surface.y >= exitTop;
}

function validateLevelRoute(level: LevelDefinition): string[] {
  let surfaces = createSurfaces(level, false);
  let spawnSurface = findSpawnSurface(level, surfaces);

  if (!spawnSurface) {
    return [`${level.id} has no safe platform below spawn.`];
  }

  let reachable = findReachableSurfaces(spawnSurface, surfaces);

  if (level.switchBridge) {
    if (!hasReachableSwitch(reachable)) {
      return [`${level.id} has a switch bridge but the switch is unreachable.`];
    }

    surfaces = createSurfaces(level, true);
    spawnSurface = findSpawnSurface(level, surfaces);

    if (!spawnSurface) {
      return [`${level.id} has no safe platform below spawn after bridge reveal.`];
    }

    reachable = findReachableSurfaces(spawnSurface, surfaces);
  }

  const bombSurfaces = [...reachable].filter((surface) =>
    canDefuseBomb(surface, level.bomb),
  );

  if (bombSurfaces.length === 0) {
    return [`${level.id} cannot reach the Formula Bomb.`];
  }

  const exitReachableAfterDefuse = bombSurfaces.some((surface) =>
    [...findReachableSurfaces(surface, surfaces)].some((candidate) =>
      canEnterExit(candidate, level.exit),
    ),
  );

  if (!exitReachableAfterDefuse) {
    return [`${level.id} cannot reach the exit after defusing the bomb.`];
  }

  return [];
}

test('all levels have reachable bomb and exit routes', () => {
  const errors = levels.flatMap((level) => validateLevelRoute(level));

  expect(errors).toEqual([]);
});

test('boots the menu and renders an interactive Phaser canvas', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'F-Bomb: Formula Bomb' }),
  ).toBeVisible();

  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByRole('heading', { name: 'Grass Blocks' })).toBeVisible();

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        const node = element as HTMLCanvasElement;
        return node.width > 0 && node.height > 0;
      }),
    )
    .toBe(true);

  const before = await canvas.screenshot();
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(450);
  await page.keyboard.up('ArrowRight');
  const after = await canvas.screenshot();

  expect(Buffer.compare(before, after)).not.toBe(0);
  await expect(page.getByRole('button', { name: 'Move right' })).toBeHidden();
  expect(consoleErrors).toEqual([]);
});

test('moves with visible virtual controls on small screens', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByRole('heading', { name: 'Grass Blocks' })).toBeVisible();

  const canvas = page.locator('canvas');
  const gameFrame = page.locator('.game-canvas');
  await expect(canvas).toBeVisible();
  await expect
    .poll(() =>
      canvas.evaluate((element) => {
        const node = element as HTMLCanvasElement;
        return node.width > 0 && node.height > 0;
      }),
    )
    .toBe(true);

  const rightButton = page.getByRole('button', { name: 'Move right' });
  await expect(rightButton).toBeVisible();

  const before = await canvas.screenshot();
  const frameBox = await gameFrame.boundingBox();
  const box = await rightButton.boundingBox();
  if (!frameBox || !box) {
    throw new Error('Move right button was not measurable.');
  }

  expect(box.x).toBeGreaterThanOrEqual(frameBox.x);
  expect(box.y).toBeGreaterThanOrEqual(frameBox.y);
  expect(box.x + box.width).toBeLessThanOrEqual(frameBox.x + frameBox.width);
  expect(box.y + box.height).toBeLessThanOrEqual(frameBox.y + frameBox.height);

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(450);
  await page.mouse.up();

  const after = await canvas.screenshot();
  expect(Buffer.compare(before, after)).not.toBe(0);
  expect(consoleErrors).toEqual([]);
});

test('handles the virtual jump control without console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /continue/i }).click();
  await expect(page.getByRole('heading', { name: 'Grass Blocks' })).toBeVisible();

  const jumpButton = page.getByRole('button', { name: 'Jump' });
  await expect(jumpButton).toBeVisible();

  const box = await jumpButton.boundingBox();
  if (!box) {
    throw new Error('Jump button was not measurable.');
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(120);
  await page.mouse.up();

  expect(consoleErrors).toEqual([]);
});

test('renders Cave Run as an unlocked playable level', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'fbomb.progress.v1',
      JSON.stringify({
        completedLevels: ['level-1'],
        rewards: ['grass-block-badge'],
      }),
    );
  });

  await page.goto('/');
  await page.getByRole('button', { exact: true, name: 'Map' }).click();

  const caveRun = page.locator('.level-card').filter({ hasText: 'Cave Run' });
  await caveRun.getByRole('button', { name: /play/i }).click();

  await expect(page.getByRole('heading', { name: 'Cave Run' })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(consoleErrors).toEqual([]);
});

test('renders Sparkstone Lab as an unlocked playable level', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'fbomb.progress.v1',
      JSON.stringify({
        completedLevels: ['level-1', 'level-2', 'level-3'],
        rewards: ['grass-block-badge', 'stone-block-badge', 'blue-crystal'],
      }),
    );
  });

  await page.goto('/');
  await page.getByRole('button', { exact: true, name: 'Map' }).click();

  const sparkstoneLab = page
    .locator('.level-card')
    .filter({ hasText: 'Sparkstone Lab' });
  await sparkstoneLab.getByRole('button', { name: /play/i }).click();

  await expect(
    page.getByRole('heading', { name: 'Sparkstone Lab' }),
  ).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(consoleErrors).toEqual([]);
});

test('renders Lava Room as an unlocked playable level', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'fbomb.progress.v1',
      JSON.stringify({
        completedLevels: ['level-1', 'level-2', 'level-3', 'level-4'],
        rewards: [
          'grass-block-badge',
          'stone-block-badge',
          'blue-crystal',
          'sparkstone-dust',
        ],
      }),
    );
  });

  await page.goto('/');
  await page.getByRole('button', { exact: true, name: 'Map' }).click();

  const lavaRoom = page.locator('.level-card').filter({ hasText: 'Lava Room' });
  await lavaRoom.getByRole('button', { name: /play/i }).click();

  await expect(page.getByRole('heading', { name: 'Lava Room' })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(consoleErrors).toEqual([]);
});

test('renders Sky Lift as an unlocked playable level', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'fbomb.progress.v1',
      JSON.stringify({
        completedLevels: ['level-1', 'level-2', 'level-3', 'level-4', 'level-5'],
        rewards: [],
      }),
    );
  });

  await page.goto('/');
  await page.getByRole('button', { exact: true, name: 'Map' }).click();

  const skyLift = page.locator('.level-card').filter({ hasText: 'Sky Lift' });
  await skyLift.getByRole('button', { name: /play/i }).click();

  await expect(page.getByRole('heading', { name: 'Sky Lift' })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(consoleErrors).toEqual([]);
});

test('renders Prism Steps as an unlocked playable level', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'fbomb.progress.v1',
      JSON.stringify({
        completedLevels: [
          'level-1',
          'level-2',
          'level-3',
          'level-4',
          'level-5',
          'level-6',
          'level-7',
        ],
        rewards: [],
      }),
    );
  });

  await page.goto('/');
  await page.getByRole('button', { exact: true, name: 'Map' }).click();

  const prismSteps = page
    .locator('.level-card')
    .filter({ hasText: 'Prism Steps' });
  await prismSteps.getByRole('button', { name: /play/i }).click();

  await expect(page.getByRole('heading', { name: 'Prism Steps' })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(consoleErrors).toEqual([]);
});

test('renders Bomb Core as an unlocked playable level', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'fbomb.progress.v1',
      JSON.stringify({
        completedLevels: [
          'level-1',
          'level-2',
          'level-3',
          'level-4',
          'level-5',
          'level-6',
          'level-7',
          'level-8',
          'level-9',
        ],
        rewards: [],
      }),
    );
  });

  await page.goto('/');
  await page.getByRole('button', { exact: true, name: 'Map' }).click();

  const bombCore = page.locator('.level-card').filter({ hasText: 'Bomb Core' });
  await bombCore.getByRole('button', { name: /play/i }).click();

  await expect(page.getByRole('heading', { name: 'Bomb Core' })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(consoleErrors).toEqual([]);
});

test('applies the Challenge maths skill preset', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { exact: true, name: 'Settings' }).click();

  await page.getByRole('button', { name: 'Challenge' }).click();

  await expect(page.getByLabel('Fractions')).toBeChecked();
  await expect(page.getByLabel('Division')).toBeChecked();
  await expect(page.getByLabel('Time maths')).toBeChecked();
  await expect(page.getByLabel('Squares and cubes')).toBeChecked();
  await expect(page.getByLabel('Roots')).not.toBeChecked();
  await expect(page.getByLabel('Missing numbers')).toBeChecked();
  await expect(page.getByLabel('Two-step questions')).toBeChecked();

  await page.getByRole('button', { name: 'Expert' }).click();
  await expect(page.getByLabel('Roots')).toBeChecked();
});

test('renders the generated expert level range', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'fbomb.progress.v1',
      JSON.stringify({
        completedLevels: Array.from(
          { length: 99 },
          (_, index) => `level-${index + 1}`,
        ),
        rewards: [],
      }),
    );
  });

  await page.goto('/');
  await page.getByRole('button', { exact: true, name: 'Map' }).click();

  const expertLevel = page.locator('.level-card').filter({ hasText: 'Prism Run 100' });
  await expertLevel.getByRole('button', { name: /play/i }).click();

  await expect(page.getByRole('heading', { name: 'Prism Run 100' })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('resets generated late levels after falling into a gap', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    window.localStorage.setItem(
      'fbomb.progress.v1',
      JSON.stringify({
        completedLevels: Array.from(
          { length: 89 },
          (_, index) => `level-${index + 1}`,
        ),
        rewards: [],
      }),
    );
  });

  await page.goto('/');
  await page.getByRole('button', { exact: true, name: 'Map' }).click();

  const lateLevel = page.locator('.level-card').filter({ hasText: 'Granite Run 90' });
  await lateLevel.getByRole('button', { name: /play/i }).click();

  await expect(page.getByRole('heading', { name: 'Granite Run 90' })).toBeVisible();
  await expect(page.locator('canvas')).toBeVisible();

  await page.evaluate(() => {
    const target = window as Window & { __fbombResetMessages?: string[] };
    const canvas = document.querySelector('canvas');

    if (!canvas) {
      throw new Error('Game canvas was not found.');
    }

    target.__fbombResetMessages = [];
    canvas.addEventListener('fbomb:soft-reset', (event) => {
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      target.__fbombResetMessages?.push(detail.message ?? 'reset');
    });
  });

  await page.keyboard.down('ArrowRight');
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const target = window as Window & { __fbombResetMessages?: string[] };
          return target.__fbombResetMessages?.[0] ?? null;
        }),
      { timeout: 6_000 },
    )
    .toBe('Down the gap. Back to the last safe block.');
  await page.keyboard.up('ArrowRight');

  expect(consoleErrors).toEqual([]);
});

test('can recreate game scenes without stale listener console errors', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/');

  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { exact: true, name: 'Home' }).click();
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page.locator('canvas')).toBeVisible();
    await page.locator('.game-header').getByRole('button', { name: 'Map' }).click();
    await expect(
      page.getByRole('heading', { name: 'Formula Bomb Map' }),
    ).toBeVisible();
  }

  expect(consoleErrors).toEqual([]);
});
