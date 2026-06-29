import { test, expect } from '@playwright/test';

/**
 * E2E: Full application load with federated modules.
 *
 * Validates Requirements: 2.1, 2.2, 10.1
 */
test.describe('Application Load', () => {
  test('loads the full application with navigation and federated content', async ({
    page,
  }) => {
    await page.goto('/');

    // The app should redirect from / to /portfolio
    await page.waitForURL('**/portfolio');

    // Header should be visible with app title
    await expect(page.locator('.header-bar__title')).toHaveText(
      'Wealth Analytics',
    );

    // User avatar placeholder should be visible
    await expect(page.locator('.header-bar__avatar')).toBeVisible();
  });

  test('renders navigation sidebar on desktop viewport @desktop', async ({
    page,
  }) => {
    await page.goto('/portfolio');

    // Sidebar navigation should be visible
    const sidebar = page.locator('.nav-sidebar');
    await expect(sidebar).toBeVisible();

    // All three nav items should be present
    await expect(sidebar.getByText('Portfolio')).toBeVisible();
    await expect(sidebar.getByText('Currencies')).toBeVisible();
    await expect(sidebar.getByText('Transactions')).toBeVisible();

    // Wait for federated content to fully load (data or error state)
    await expect(
      page
        .locator(
          '[data-testid="stock-balances-view"], [data-testid="stock-balances-error"]',
        )
        .first(),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('loads federated Data_Dashboard content (stock balances view)', async ({
    page,
  }) => {
    await page.goto('/portfolio');

    // Wait for either the data view, loading state, or error state to appear
    // This confirms the federated module loaded and rendered something
    await expect(
      page
        .locator(
          '[data-testid="stock-balances-view"], [aria-label="Loading stock balances"], [data-testid="stock-balances-error"]',
        )
        .first(),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('loads federated Devtools_Panel widget', async ({ page }) => {
    await page.goto('/portfolio');

    // The devtools floating button should be visible
    const devtoolsWidget = page.locator('[data-testid="devtools-widget"]');
    await expect(devtoolsWidget).toBeVisible({ timeout: 30_000 });

    // The FAB button should be present
    const fabButton = devtoolsWidget.locator(
      'button[aria-label="Open devtools panel"]',
    );
    await expect(fabButton).toBeVisible();
  });
});
