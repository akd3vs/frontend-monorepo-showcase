import { defineConfig, devices } from '@playwright/test';

import { PIXEL_DIFF_THRESHOLD, VIEWPORTS } from './tests/visual/visual-test.config';

/**
 * Playwright configuration for visual regression testing.
 *
 * Tests run against a locally-served Storybook instance using iframe URLs.
 * Screenshots are compared pixel-by-pixel against baselines stored in version control.
 */
export default defineConfig({
  testDir: './tests/visual',
  testMatch: '**/*.visual.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 30_000,

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: PIXEL_DIFF_THRESHOLD,
      animations: 'disabled',
    },
  },

  /* Snapshot path template places baselines under __baselines__/ */
  snapshotPathTemplate: '{testDir}/__baselines__/{testFilePath}/{arg}{ext}',

  use: {
    baseURL: 'http://localhost:6006',
    /* Disable animations globally for deterministic screenshots */
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: VIEWPORTS.mobile,
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: VIEWPORTS.tablet,
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: VIEWPORTS.desktop,
      },
    },
  ],

  /* Storybook dev server — started automatically if not already running */
  webServer: {
    command: 'npx storybook dev -p 6006 --ci --no-open',
    port: 6006,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
