import { test, expect } from '@playwright/test';

/**
 * E2E: Feature flag toggle affecting UI.
 *
 * Validates Requirements: 16.4
 */
test.describe('Feature Flags', () => {
  test('opens devtools panel and displays feature flags', async ({ page }) => {
    await page.goto('/portfolio');

    // Wait for the devtools widget to load
    const devtoolsWidget = page.locator('[data-testid="devtools-widget"]');
    await expect(devtoolsWidget).toBeVisible({ timeout: 30_000 });

    // Click the FAB to expand the panel
    const fabButton = devtoolsWidget.locator(
      'button[aria-label="Open devtools panel"]',
    );
    await fabButton.click();

    // Panel dialog should be visible
    const panel = devtoolsWidget.locator('div[role="dialog"]');
    await expect(panel).toBeVisible();

    // Should display "Feature Flags" heading
    await expect(panel.locator('h2')).toHaveText('Feature Flags');

    // Should list the registered flags
    await expect(panel.getByText('dark-mode')).toBeVisible();
    await expect(panel.getByText('new-dashboard-layout')).toBeVisible();
    await expect(panel.getByText('real-time-updates')).toBeVisible();
  });

  test('toggling a feature flag updates the toggle state', async ({
    page,
  }) => {
    await page.goto('/portfolio');

    // Wait for devtools widget
    const devtoolsWidget = page.locator('[data-testid="devtools-widget"]');
    await expect(devtoolsWidget).toBeVisible({ timeout: 30_000 });

    // Open the panel
    const fabButton = devtoolsWidget.locator(
      'button[aria-label="Open devtools panel"]',
    );
    await fabButton.click();

    const panel = devtoolsWidget.locator('div[role="dialog"]');
    await expect(panel).toBeVisible();

    // Find the dark-mode toggle switch
    const darkModeToggle = panel.locator(
      'button[role="switch"][aria-label="Toggle dark-mode"]',
    );
    await expect(darkModeToggle).toBeVisible();

    // Initially should be off (defaultValue: false)
    await expect(darkModeToggle).toHaveAttribute('aria-checked', 'false');

    // Toggle it on
    await darkModeToggle.click();

    // Should now be checked
    await expect(darkModeToggle).toHaveAttribute('aria-checked', 'true');

    // Toggle it back off
    await darkModeToggle.click();
    await expect(darkModeToggle).toHaveAttribute('aria-checked', 'false');
  });

  test('feature flag state persists across panel close/open', async ({
    page,
  }) => {
    await page.goto('/portfolio');

    const devtoolsWidget = page.locator('[data-testid="devtools-widget"]');
    await expect(devtoolsWidget).toBeVisible({ timeout: 30_000 });

    // Open panel
    const fabButton = devtoolsWidget.locator(
      'button[aria-label="Open devtools panel"]',
    );
    await fabButton.click();

    const panel = devtoolsWidget.locator('div[role="dialog"]');
    await expect(panel).toBeVisible();

    // Toggle dark-mode on
    const darkModeToggle = panel.locator(
      'button[role="switch"][aria-label="Toggle dark-mode"]',
    );
    await darkModeToggle.click();
    await expect(darkModeToggle).toHaveAttribute('aria-checked', 'true');

    // Close the panel
    const closeButton = devtoolsWidget.locator(
      'button[aria-label="Close devtools panel"]',
    );
    await closeButton.click();
    await expect(panel).toBeHidden();

    // Re-open the panel
    const openButton = devtoolsWidget.locator(
      'button[aria-label="Open devtools panel"]',
    );
    await openButton.click();

    const reopenedPanel = devtoolsWidget.locator('div[role="dialog"]');
    await expect(reopenedPanel).toBeVisible();

    // The toggle should still be on (state persisted)
    const persistedToggle = reopenedPanel.locator(
      'button[role="switch"][aria-label="Toggle dark-mode"]',
    );
    await expect(persistedToggle).toHaveAttribute('aria-checked', 'true');
  });

  test('closes devtools panel with Escape key', async ({ page }) => {
    await page.goto('/portfolio');

    const devtoolsWidget = page.locator('[data-testid="devtools-widget"]');
    await expect(devtoolsWidget).toBeVisible({ timeout: 30_000 });

    // Open panel
    const fabButton = devtoolsWidget.locator(
      'button[aria-label="Open devtools panel"]',
    );
    await fabButton.click();

    const panel = devtoolsWidget.locator('div[role="dialog"]');
    await expect(panel).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Panel should close
    await expect(panel).toBeHidden();
  });
});
