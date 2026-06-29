import { test, expect } from '@playwright/test';

/**
 * E2E: View transitions between routes.
 *
 * Validates Requirements: 20.1
 *
 * View Transitions API uses CSS animations (fade-in / fade-out) for route changes.
 * We verify that the CSS classes/styles for view transitions are present and that
 * stable elements (nav-sidebar, header-bar) have view-transition-name set.
 */
test.describe('View Transitions @desktop', () => {

  test('navigation sidebar has view-transition-name CSS property', async ({
    page,
  }) => {
    await page.goto('/portfolio');

    const sidebar = page.locator('.nav-sidebar');
    await expect(sidebar).toBeVisible();

    // Check that the sidebar has the view-transition-name CSS property
    const transitionName = await sidebar.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('view-transition-name'),
    );
    expect(transitionName.trim()).toBe('nav-sidebar');
  });

  test('header bar has view-transition-name CSS property', async ({ page }) => {
    await page.goto('/portfolio');

    const header = page.locator('.header-bar');
    await expect(header).toBeVisible();

    const transitionName = await header.evaluate((el) =>
      getComputedStyle(el).getPropertyValue('view-transition-name'),
    );
    expect(transitionName.trim()).toBe('header-bar');
  });

  test('route navigation triggers view transition (content changes smoothly)', async ({
    page,
  }) => {
    await page.goto('/portfolio');
    await expect(page.locator('.shell-main h1')).toHaveText('Portfolio');

    // Navigate to Currencies and verify content changes
    await page.locator('.nav-sidebar').getByText('Currencies').click();
    await page.waitForURL('**/currencies');

    // After transition, the new content should be visible
    await expect(page.locator('.shell-main h1')).toHaveText('Currencies');

    // The sidebar and header should remain stable (still visible)
    await expect(page.locator('.nav-sidebar')).toBeVisible();
    await expect(page.locator('.header-bar')).toBeVisible();
  });

  test('view transition CSS animations are defined in stylesheets', async ({
    page,
  }) => {
    await page.goto('/portfolio');

    // Wait for the page to fully load and styles to be injected
    await page.waitForLoadState('domcontentloaded');
    await page.locator('.nav-sidebar').waitFor({ state: 'visible' });

    // Verify that the view transition CSS (fade-in/fade-out animations) is loaded.
    // Vite dev mode injects styles via <style> tags.
    const hasTransitionCSS = await page.evaluate(() => {
      // Check inline <style> elements (Vite dev mode injects CSS this way)
      const styleElements = document.querySelectorAll('style');
      for (const el of styleElements) {
        const text = el.textContent || '';
        if (text.includes('fade-out') && text.includes('fade-in')) {
          return true;
        }
      }

      // Also check document.styleSheets CSSRules as fallback
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (
              rule instanceof CSSKeyframesRule &&
              (rule.name === 'fade-out' || rule.name === 'fade-in')
            ) {
              return true;
            }
          }
        } catch {
          continue;
        }
      }

      return false;
    });

    expect(hasTransitionCSS).toBe(true);
  });

  test('rapid navigation between routes works without errors', async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/portfolio');
    await expect(page.locator('.shell-main h1')).toHaveText('Portfolio');

    // Rapidly navigate between routes
    await page.locator('.nav-sidebar').getByText('Currencies').click();
    await page.locator('.nav-sidebar').getByText('Transactions').click();
    await page.locator('.nav-sidebar').getByText('Portfolio').click();

    // Give time for any async operations to settle
    await page.waitForTimeout(1000);

    // Final route should be portfolio
    await page.waitForURL('**/portfolio');
    await expect(page.locator('.shell-main h1')).toHaveText('Portfolio');

    // No page errors should have occurred from rapid transitions
    expect(errors).toHaveLength(0);
  });
});
