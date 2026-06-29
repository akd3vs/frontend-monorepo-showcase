import baseConfig from '../../eslint.config.base.mjs';

export default [
  { ignores: ['storybook-static/**', 'playwright-report/**', '**/*.d.ts'] },
  ...baseConfig,
];
