import { expect, test } from '@playwright/test';
import { getLevel, type BlockRun } from '../src/game/systems/levelRegistry';

const TILE = 32;

function runEnd(run: BlockRun): number {
  return run.x + run.width * TILE;
}

function jumpGap(from: BlockRun, to: BlockRun): number {
  return Math.max(to.x - runEnd(from), from.x - runEnd(to), 0);
}

test('level 22 has a reachable final bomb approach', () => {
  const level = getLevel('level-22');
  const bombPlatform = level.platforms.find(
    (run) =>
      level.bomb.x >= run.x &&
      level.bomb.x <= runEnd(run) &&
      run.y > level.bomb.y,
  );

  if (!bombPlatform) {
    throw new Error('Level 22 has no platform under the bomb.');
  }

  const approach = level.platforms.find(
    (run) =>
      run !== bombPlatform &&
      run.y > bombPlatform.y &&
      run.y - bombPlatform.y <= 96 &&
      jumpGap(run, bombPlatform) <= 96,
  );

  if (!approach) {
    throw new Error('Level 22 has no reachable step onto the bomb platform.');
  }

  const feeder = level.platforms.find(
    (run) =>
      run !== approach &&
      run !== bombPlatform &&
      run.y >= approach.y &&
      run.y - approach.y <= 96 &&
      jumpGap(run, approach) <= 96,
  );

  expect(feeder).toBeTruthy();
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
