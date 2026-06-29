import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for the frontend-monorepo-showcase.
 *
 * Starts all three dev servers (host-shell, data-dashboard, devtools-panel)
 * via the webServer option before running tests.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
      grepInvert: /@mobile/,
    },
    {
      name: 'mobile-chromium',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 },
      },
      grepInvert: /@desktop/,
    },
  ],

  webServer: [
    {
      command: 'npx nx dev @frontend-monorepo-showcase/data-dashboard',
      port: 3001,
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
      cwd: '..',
    },
    {
      command: 'npx nx dev @frontend-monorepo-showcase/devtools-panel',
      port: 3002,
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
      cwd: '..',
    },
    {
      command: 'npx nx dev @frontend-monorepo-showcase/host-shell',
      port: 3000,
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
      cwd: '..',
    },
  ],
});
