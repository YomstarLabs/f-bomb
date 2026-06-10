import { expect, test } from '@playwright/test';

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
  const box = await rightButton.boundingBox();
  if (!box) {
    throw new Error('Move right button was not measurable.');
  }

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
  await expect(page.getByLabel('Missing numbers')).toBeChecked();
  await expect(page.getByLabel('Two-step questions')).toBeChecked();
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
