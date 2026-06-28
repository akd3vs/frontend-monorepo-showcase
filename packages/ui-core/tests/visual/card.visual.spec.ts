import { THEMES } from './visual-test.config';
import { test, expect } from './visual-test.fixture';

/**
 * Visual snapshot tests for the Card component.
 *
 * Validates: Requirements 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5
 *
 * Covers 2 card configurations (with footer / without footer) across both themes,
 * plus high-contrast mode captures.
 */

const STORYBOOK_BASE = 'http://localhost:6006/iframe.html';

const CARD_STORIES = {
  'with-title-and-body': 'components-card--with-title-and-body',
  'with-footer': 'components-card--with-footer',
} as const;

function storyUrl(storyId: string): string {
  return `${STORYBOOK_BASE}?id=${storyId}&viewMode=story`;
}

// ─── Card Theme Tests ────────────────────────────────────────────────────────

for (const theme of THEMES) {
  test.describe(`Card [${theme}]`, () => {
    for (const [name, storyId] of Object.entries(CARD_STORIES)) {
      test(`config: ${name}`, async ({ page }) => {
        await page.goto(storyUrl(storyId));
        await page.waitForSelector('#storybook-root');

        if (theme === 'dark') {
          await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark');
          });
        }

        const root = page.locator('#storybook-root');
        await expect(root).toHaveScreenshot(`card-${name}-${theme}.png`);
      });
    }
  });
}

// ─── High-Contrast Mode ──────────────────────────────────────────────────────

for (const theme of THEMES) {
  test.describe(`Card high-contrast [${theme}]`, () => {
    for (const [name, storyId] of Object.entries(CARD_STORIES)) {
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
        await expect(root).toHaveScreenshot(`card-${name}-${theme}-high-contrast.png`);
      });
    }
  });
}
