import { THEMES } from './visual-test.config';
import { test, expect } from './visual-test.fixture';

/**
 * Visual snapshot tests for the ErrorBoundary component.
 *
 * Validates: Requirements 7.1, 7.2, 8.1, 8.2, 8.3, 8.4, 8.5, 18.5
 *
 * Covers recovery UI and escalated error states across both themes,
 * plus high-contrast mode captures.
 */

const STORYBOOK_BASE = 'http://localhost:6006/iframe.html';

const ERROR_BOUNDARY_STORIES = {
  'recovery-ui': 'components-errorboundary--recovery-ui',
  'escalated-state': 'components-errorboundary--escalated-state',
} as const;

function storyUrl(storyId: string): string {
  return `${STORYBOOK_BASE}?id=${storyId}&viewMode=story`;
}

// ─── ErrorBoundary Theme Tests ───────────────────────────────────────────────

for (const theme of THEMES) {
  test.describe(`ErrorBoundary [${theme}]`, () => {
    for (const [name, storyId] of Object.entries(ERROR_BOUNDARY_STORIES)) {
      test(`error-state: ${name}`, async ({ page }) => {
        await page.goto(storyUrl(storyId));
        await page.waitForSelector('#storybook-root');

        if (theme === 'dark') {
          await page.evaluate(() => {
            document.documentElement.setAttribute('data-theme', 'dark');
          });
        }

        const root = page.locator('#storybook-root');
        await expect(root).toHaveScreenshot(`errorboundary-${name}-${theme}.png`);
      });
    }
  });
}

// ─── High-Contrast Mode ──────────────────────────────────────────────────────

for (const theme of THEMES) {
  test.describe(`ErrorBoundary high-contrast [${theme}]`, () => {
    for (const [name, storyId] of Object.entries(ERROR_BOUNDARY_STORIES)) {
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
        await expect(root).toHaveScreenshot(`errorboundary-${name}-${theme}-high-contrast.png`);
      });
    }
  });
}
