import { THEMES } from './visual-test.config';
import { test, expect } from './visual-test.fixture';

/**
 * Visual snapshot tests for the Button component.
 *
 * Validates: Requirements 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5
 *
 * Covers all 9 variant×size combinations, disabled states across both themes,
 * plus high-contrast mode captures.
 */

const STORYBOOK_BASE = 'http://localhost:6006/iframe.html';

const BUTTON_STORIES = {
  'primary-small': 'components-button--primary-small',
  'primary-medium': 'components-button--primary-medium',
  'primary-large': 'components-button--primary-large',
  'secondary-small': 'components-button--secondary-small',
  'secondary-medium': 'components-button--secondary-medium',
  'secondary-large': 'components-button--secondary-large',
  'ghost-small': 'components-button--ghost-small',
  'ghost-medium': 'components-button--ghost-medium',
  'ghost-large': 'components-button--ghost-large',
} as const;

const DISABLED_STORIES = {
  'primary-disabled': 'components-button--primary-disabled',
  'secondary-disabled': 'components-button--secondary-disabled',
  'ghost-disabled': 'components-button--ghost-disabled',
} as const;

function storyUrl(storyId: string): string {
  return `${STORYBOOK_BASE}?id=${storyId}&viewMode=story`;
}

// ─── Variant × Size × Theme Tests ───────────────────────────────────────────

for (const theme of THEMES) {
  test.describe(`Button [${theme}]`, () => {
    for (const [name, storyId] of Object.entries(BUTTON_STORIES)) {
      test(`variant-size: ${name}`, async ({ page }) => {
        await page.goto(storyUrl(storyId));
        await page.waitForSelector('#storybook-root');

        if (theme === 'dark') {
          await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark');
          });
        }

        const root = page.locator('#storybook-root');
        await expect(root).toHaveScreenshot(`button-${name}-${theme}.png`);
      });
    }

    // Disabled states
    for (const [name, storyId] of Object.entries(DISABLED_STORIES)) {
      test(`disabled: ${name}`, async ({ page }) => {
        await page.goto(storyUrl(storyId));
        await page.waitForSelector('#storybook-root');

        if (theme === 'dark') {
          await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark');
          });
        }

        const root = page.locator('#storybook-root');
        await expect(root).toHaveScreenshot(`button-${name}-${theme}.png`);
      });
    }
  });
}

// ─── High-Contrast Mode ──────────────────────────────────────────────────────

for (const theme of THEMES) {
  test.describe(`Button high-contrast [${theme}]`, () => {
    for (const [name, storyId] of Object.entries(BUTTON_STORIES)) {
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
        await expect(root).toHaveScreenshot(`button-${name}-${theme}-high-contrast.png`);
      });
    }
  });
}
