import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@frontend-monorepo-showcase/design-tokens/css/layers',
        replacement: path.resolve(__dirname, '../../packages/design-tokens/src/layers.css'),
      },
      {
        find: '@frontend-monorepo-showcase/design-tokens/css/dark',
        replacement: path.resolve(__dirname, '../../packages/design-tokens/src/dark.css'),
      },
      {
        find: '@frontend-monorepo-showcase/design-tokens/css/high-contrast',
        replacement: path.resolve(__dirname, '../../packages/design-tokens/src/high-contrast.css'),
      },
      {
        find: '@frontend-monorepo-showcase/design-tokens/css',
        replacement: path.resolve(__dirname, '../../packages/design-tokens/src/tokens.css'),
      },
      {
        find: '@frontend-monorepo-showcase/design-tokens',
        replacement: path.resolve(__dirname, '../../packages/design-tokens/src'),
      },
      {
        find: '@frontend-monorepo-showcase/ui-core',
        replacement: path.resolve(__dirname, '../../packages/ui-core/src'),
      },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: false,
    css: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
