import { test, expect } from '@playwright/test';

/**
 * E2E: Responsive layout transitions (sidebar <-> bottom-bar).
 *
 * Validates Requirements: 10.1, 10.4
 */
test.describe('Responsive Layout', () => {
  test.describe('Desktop viewport', () => {
    test.beforeEach(async ({}, testInfo) => {
      if (testInfo.project.name === 'mobile-chromium') {
        test.skip();
      }
    });

    test('shows sidebar navigation, hides bottom bar', async ({ page }) => {
      await page.goto('/portfolio');

      // Sidebar should be visible
      const sidebar = page.locator('.nav-sidebar');
      await expect(sidebar).toBeVisible();

      // Bottom bar should be hidden
      const bottomBar = page.locator('.nav-bottom-bar');
      await expect(bottomBar).toBeHidden();
    });

    test('resizing viewport toggles navigation mode', async ({ page }) => {
      await page.goto('/portfolio');

      // Start at desktop size - sidebar visible
      await expect(page.locator('.nav-sidebar')).toBeVisible();
      await expect(page.locator('.nav-bottom-bar')).toBeHidden();

      // Resize to mobile width
      await page.setViewportSize({ width: 375, height: 667 });

      // Bottom bar should appear, sidebar should hide
      await expect(page.locator('.nav-bottom-bar')).toBeVisible();
      await expect(page.locator('.nav-sidebar')).toBeHidden();

      // Resize back to desktop
      await page.setViewportSize({ width: 1280, height: 720 });

      // Sidebar should reappear, bottom bar should hide
      await expect(page.locator('.nav-sidebar')).toBeVisible();
      await expect(page.locator('.nav-bottom-bar')).toBeHidden();
    });
  });

  test.describe('Mobile viewport', () => {
    test.beforeEach(async ({}, testInfo) => {
      if (testInfo.project.name !== 'mobile-chromium') {
        test.skip();
      }
    });

    test('shows bottom bar navigation, hides sidebar', async ({ page }) => {
      await page.goto('/portfolio');

      // Bottom bar should be visible
      const bottomBar = page.locator('.nav-bottom-bar');
      await expect(bottomBar).toBeVisible();

      // Sidebar should be hidden
      const sidebar = page.locator('.nav-sidebar');
      await expect(sidebar).toBeHidden();
    });
  });
});
