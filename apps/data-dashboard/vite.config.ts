import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { ports } from '../../ports.config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  resolve: {
    alias:
      mode !== 'production'
        ? [
            { find: '@frontend-monorepo-showcase/design-tokens/css/layers', replacement: path.resolve(__dirname, '../../packages/design-tokens/src/layers.css') },
            { find: '@frontend-monorepo-showcase/design-tokens/css/dark', replacement: path.resolve(__dirname, '../../packages/design-tokens/src/dark.css') },
            { find: '@frontend-monorepo-showcase/design-tokens/css', replacement: path.resolve(__dirname, '../../packages/design-tokens/src/tokens.css') },
            { find: '@frontend-monorepo-showcase/design-tokens', replacement: path.resolve(__dirname, '../../packages/design-tokens/src') },
            { find: '@frontend-monorepo-showcase/ui-core', replacement: path.resolve(__dirname, '../../packages/ui-core/src') },
            { find: '@frontend-monorepo-showcase/mock-engine', replacement: path.resolve(__dirname, '../../packages/mock-engine/src') },
          ]
        : [],
  },
  plugins: [
    react(),
    federation({
      name: 'data_dashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './DashboardApp': './src/DashboardApp.tsx',
        './StockBalancesView': './src/views/StockBalancesView.tsx',
        './CurrencyAllocationsView': './src/views/CurrencyAllocationsView.tsx',
        './TransactionLedgerView': './src/views/TransactionLedgerView.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@tanstack/react-query': { singleton: true },
      },
    }),
  ],
  server: {
    port: ports.dataDashboard,
    host: true,
    fs: {
      allow: ['../..'],
    },
  },
  build: {
    target: 'esnext',
    modulePreload: false,
    minify: false,
  },
}));
