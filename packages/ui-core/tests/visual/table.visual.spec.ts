import { THEMES } from './visual-test.config';
import { test, expect } from './visual-test.fixture';

/**
 * Visual snapshot tests for the Table component.
 *
 * Validates: Requirements 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5
 *
 * Covers populated and empty table states across both themes,
 * plus high-contrast mode captures.
 */

const STORYBOOK_BASE = 'http://localhost:6006/iframe.html';

const TABLE_STORIES = {
  populated: 'components-table--populated',
  empty: 'components-table--empty',
} as const;

function storyUrl(storyId: string): string {
  return `${STORYBOOK_BASE}?id=${storyId}&viewMode=story`;
}

// ─── Table Theme Tests ───────────────────────────────────────────────────────

for (const theme of THEMES) {
  test.describe(`Table [${theme}]`, () => {
    for (const [name, storyId] of Object.entries(TABLE_STORIES)) {
      test(`state: ${name}`, async ({ page }) => {
        await page.goto(storyUrl(storyId));
        await page.waitForSelector('#storybook-root');

        if (theme === 'dark') {
          await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark');
          });
        }

        const root = page.locator('#storybook-root');
        await expect(root).toHaveScreenshot(`table-${name}-${theme}.png`);
      });
    }
  });
}

// ─── High-Contrast Mode ──────────────────────────────────────────────────────

for (const theme of THEMES) {
  test.describe(`Table high-contrast [${theme}]`, () => {
    for (const [name, storyId] of Object.entries(TABLE_STORIES)) {
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
        await expect(root).toHaveScreenshot(`table-${name}-${theme}-high-contrast.png`);
      });
    }
  });
}
