import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { ports } from '../../ports.config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias:
      process.env.NODE_ENV === 'development'
        ? {
            '@frontend-monorepo-showcase/ui-core': path.resolve(
              __dirname,
              '../../packages/ui-core/src',
            ),
            '@frontend-monorepo-showcase/mock-engine': path.resolve(
              __dirname,
              '../../packages/mock-engine/src',
            ),
          }
        : {},
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
});
