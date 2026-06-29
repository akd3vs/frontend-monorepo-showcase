import { test, expect } from '@playwright/test';

/**
 * E2E: Dark mode toggle via feature flag system.
 *
 * Validates that toggling the dark-mode feature flag changes the app's
 * visual theme by setting data-theme="dark" on the HTML element and
 * applying dark mode CSS variables.
 */
test.describe('Dark mode toggle', () => {
  test('toggling dark-mode feature flag changes background color', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify light mode is active initially
    const html = page.locator('html');
    await expect(html).not.toHaveAttribute('data-theme', 'dark');

    // Get initial background color of body
    const initialBg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );

    // The initial bg should be light (not dark mode slate)
    expect(initialBg).not.toContain('15, 23, 42'); // Not dark mode --color-surface

    // Toggle dark mode via localStorage (simulating feature flag toggle)
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('feature-flags') || '{}');
      state.overrides = { ...state.overrides, 'dark-mode': true };
      state.version = 1;
      state.updatedAt = new Date().toISOString();
      localStorage.setItem('feature-flags', JSON.stringify(state));
    });

    // Reload to pick up the persisted flag state
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify dark mode is active
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Get the background color - should be dark now
    const darkBg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );

    // Dark mode bg should NOT be the same as light mode
    expect(darkBg).not.toBe(initialBg);
  });

  test('toggling dark-mode via devtools panel applies theme immediately', async ({ page }) => {
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');

    // Wait for federated content to fully load before interacting
    await expect(
      page
        .locator(
          '[data-testid="stock-balances-view"], [data-testid="stock-balances-error"]',
        )
        .first(),
    ).toBeVisible({ timeout: 30_000 });

    const html = page.locator('html');

    // Verify light mode initially
    await expect(html).not.toHaveAttribute('data-theme', 'dark');

    // Wait for the devtools widget to load
    const devtoolsWidget = page.locator('[data-testid="devtools-widget"]');
    await expect(devtoolsWidget).toBeVisible({ timeout: 30_000 });

    // Open the panel
    const fabButton = devtoolsWidget.locator(
      'button[aria-label="Open devtools panel"]',
    );
    await fabButton.click();

    const panel = devtoolsWidget.locator('div[role="dialog"]');
    await expect(panel).toBeVisible();

    // Find and click the dark-mode toggle
    const darkModeToggle = panel.locator(
      'button[role="switch"][aria-label="Toggle dark-mode"]',
    );
    await expect(darkModeToggle).toBeVisible();
    await darkModeToggle.click();

    // Verify dark mode is now active on the HTML element
    await expect(html).toHaveAttribute('data-theme', 'dark', { timeout: 5_000 });

    // Verify the background color changed
    const darkBg = await page.evaluate(() =>
      window.getComputedStyle(document.body).backgroundColor
    );
    // dark.css sets --color-surface: #1e293b which is rgb(30, 41, 59)
    // --color-background: #0f172a which is rgb(15, 23, 42)
    expect(darkBg).toContain('30, 41, 59'); // dark mode surface color
  });
});
