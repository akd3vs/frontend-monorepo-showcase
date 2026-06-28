/* eslint-disable react-hooks/rules-of-hooks -- Playwright fixture, not a React hook */
import { test as base } from '@playwright/test';

import { ANIMATION_FREEZE_CSS } from './visual-test.config';

/**
 * Extended Playwright test fixture that freezes CSS animations and transitions
 * before each page load, ensuring deterministic screenshots (Requirement 8.5).
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Inject animation-freeze CSS on every frame navigation
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.setAttribute('data-visual-test', 'freeze-animations');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;
      document.head.appendChild(style);
    });

    // Also add a route handler to inject the styles after navigation
    page.on('load', async () => {
      await page.addStyleTag({ content: ANIMATION_FREEZE_CSS });
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
