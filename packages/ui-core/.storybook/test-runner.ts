import { resolve } from 'path';

import { toMatchImageSnapshot } from 'jest-image-snapshot';

import type { TestRunnerConfig } from '@storybook/test-runner';

const VIEWPORTS = [320, 768, 1280];
const BASELINES_DIR = resolve(__dirname, 'baselines');

const config: TestRunnerConfig = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    // Capture screenshot at each configured viewport
    for (const width of VIEWPORTS) {
      await page.setViewportSize({ width, height: 800 });
      // Allow layout to settle
      await page.waitForTimeout(300);

      const image = await page.screenshot({ fullPage: true });

      expect(image).toMatchImageSnapshot({
        customSnapshotsDir: BASELINES_DIR,
        customSnapshotIdentifier: `${context.id}--${width}px`,
        failureThreshold: 0.001, // 0.1% pixel difference
        failureThresholdType: 'percent',
      });
    }
  },
};

export default config;
