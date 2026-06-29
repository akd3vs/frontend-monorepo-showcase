import { THEMES } from './visual-test.config';
import { test, expect } from './visual-test.fixture';

/**
 * Visual snapshot tests for the Skeleton component.
 *
 * Validates: Requirements 7.1, 7.2, 8.1, 8.5
 *
 * Covers skeleton with animation paused (via the fixture) across both themes,
 * plus high-contrast mode captures.
 */

const STORYBOOK_BASE = 'http://localhost:6006/iframe.html';

const SKELETON_STORIES = {
  'all-variants': 'components-skeleton--all-variants',
} as const;

function storyUrl(storyId: string): string {
  return `${STORYBOOK_BASE}?id=${storyId}&viewMode=story`;
}

// ─── Skeleton Theme Tests (animation paused via fixture) ─────────────────────

for (const theme of THEMES) {
  test.describe(`Skeleton [${theme}]`, () => {
    for (const [name, storyId] of Object.entries(SKELETON_STORIES)) {
      test(`animation-paused: ${name}`, async ({ page }) => {
        await page.goto(storyUrl(storyId));
        await page.waitForSelector('#storybook-root');

        if (theme === 'dark') {
          await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark');
          });
        }

        const root = page.locator('#storybook-root');
        await expect(root).toHaveScreenshot(`skeleton-${name}-${theme}.png`);
      });
    }
  });
}

// ─── High-Contrast Mode ──────────────────────────────────────────────────────

for (const theme of THEMES) {
  test.describe(`Skeleton high-contrast [${theme}]`, () => {
    for (const [name, storyId] of Object.entries(SKELETON_STORIES)) {
      test(`high-contrast: ${name}`, async ({ page }) => {
        await page.emulateMedia({ forcedColors: 'active' });
        await page.goto(storyUrl(storyId));
        await page.waitForSelector('#storybook-root');

        if (theme === 'dark') {
          await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark');
          });
        }

        const root = page.locator('#storybook-root');
        await expect(root).toHaveScreenshot(`skeleton-${name}-${theme}-high-contrast.png`);
      });
    }
  });
}
