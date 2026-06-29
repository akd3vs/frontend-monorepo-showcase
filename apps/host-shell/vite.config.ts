import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { federation } from '@module-federation/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { ports } from '../../ports.config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => ({
  server: {
    port: ports.hostShell,
    host: true,
    fs: {
      allow: ['../..'],
    },
  },
  resolve: {
    alias:
      mode !== 'production'
        ? [
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
              replacement: path.resolve(
                __dirname,
                '../../packages/design-tokens/src/high-contrast.css',
              ),
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
            {
              find: '@frontend-monorepo-showcase/mock-engine',
              replacement: path.resolve(__dirname, '../../packages/mock-engine/src'),
            },
          ]
        : [],
  },
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    federation({
      name: 'host_shell',
      remotes: {
        data_dashboard: {
          type: 'module',
          name: 'data_dashboard',
          entry:
            process.env.VITE_DASHBOARD_REMOTE_URL ||
            (mode === 'production'
              ? '/data-dashboard/remoteEntry.js'
              : `http://localhost:${ports.dataDashboard}/remoteEntry.js`),
        },
        devtools_panel: {
          type: 'module',
          name: 'devtools_panel',
          entry:
            process.env.VITE_DEVTOOLS_REMOTE_URL ||
            (mode === 'production'
              ? '/devtools-panel/remoteEntry.js'
              : `http://localhost:${ports.devtoolsPanel}/remoteEntry.js`),
        },
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@tanstack/react-query': { singleton: true },
      },
    }),
    react(),
  ],
}));
