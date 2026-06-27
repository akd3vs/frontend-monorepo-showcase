import { test, expect } from '@playwright/test';

/**
 * E2E: Navigation flow across all routes.
 *
 * Validates Requirements: 2.1, 2.3, 2.4, 2.5, 10.1, 10.4
 */
test.describe('Navigation', () => {
  test.describe('Desktop navigation', () => {
    test.beforeEach(async ({}, testInfo) => {
      if (testInfo.project.name === 'mobile-chromium') {
        test.skip();
      }
    });

    test('navigates between all routes via sidebar links', async ({ page }) => {
      await page.goto('/portfolio');

      // Should start on Portfolio with active styling
      const portfolioLink = page.locator('.nav-sidebar__link--active');
      await expect(portfolioLink).toContainText('Portfolio');

      // Navigate to Currencies
      await page.locator('.nav-sidebar').getByText('Currencies').click();
      await page.waitForURL('**/currencies');
      await expect(page.locator('.shell-main h1')).toHaveText('Currencies');

      // Currencies link should now be active
      const currenciesLink = page.locator('.nav-sidebar__link--active');
      await expect(currenciesLink).toContainText('Currencies');

      // Navigate to Transactions
      await page.locator('.nav-sidebar').getByText('Transactions').click();
      await page.waitForURL('**/transactions');
      await expect(page.locator('.shell-main h1')).toHaveText('Transactions');

      // Transactions link should now be active
      const transactionsLink = page.locator('.nav-sidebar__link--active');
      await expect(transactionsLink).toContainText('Transactions');

      // Navigate back to Portfolio
      await page.locator('.nav-sidebar').getByText('Portfolio').click();
      await page.waitForURL('**/portfolio');
      await expect(page.locator('.shell-main h1')).toHaveText('Portfolio');
    });

    test('highlights the active navigation item', async ({ page }) => {
      await page.goto('/currencies');

      // Currencies should be highlighted
      const activeLink = page.locator('.nav-sidebar__link--active');
      await expect(activeLink).toContainText('Currencies');

      // Other links should NOT have active class
      const allLinks = page.locator('.nav-sidebar__link');
      const count = await allLinks.count();
      let activeCount = 0;
      for (let i = 0; i < count; i++) {
        const classes = await allLinks.nth(i).getAttribute('class');
        if (classes?.includes('nav-sidebar__link--active')) {
          activeCount++;
        }
      }
      expect(activeCount).toBe(1);
    });

    test('redirects root path to portfolio', async ({ page }) => {
      await page.goto('/');
      await page.waitForURL('**/portfolio');
      await expect(page.locator('.shell-main h1')).toHaveText('Portfolio');
    });
  });

  test.describe('Mobile navigation', () => {
    test.beforeEach(async ({}, testInfo) => {
      if (testInfo.project.name !== 'mobile-chromium') {
        test.skip();
      }
    });

    test('navigates between routes via bottom bar', async ({ page }) => {
      await page.goto('/portfolio');

      // Bottom bar should be visible on mobile
      const bottomBar = page.locator('.nav-bottom-bar');
      await expect(bottomBar).toBeVisible();

      // Navigate to Currencies via bottom bar
      await bottomBar.getByText('Currencies').click();
      await page.waitForURL('**/currencies');
      await expect(page.locator('.shell-main h1')).toHaveText('Currencies');

      // Navigate to Transactions
      await bottomBar.getByText('Transactions').click();
      await page.waitForURL('**/transactions');
      await expect(page.locator('.shell-main h1')).toHaveText('Transactions');
    });
  });
});
