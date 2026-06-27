import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { federation } from '@module-federation/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { ports } from '../../ports.config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    port: ports.hostShell,
    host: true,
    fs: {
      allow: ['../..'],
    },
  },
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
            (process.env.NODE_ENV === 'production'
              ? '/data-dashboard/remoteEntry.js'
              : `http://localhost:${ports.dataDashboard}/remoteEntry.js`),
        },
        devtools_panel: {
          type: 'module',
          name: 'devtools_panel',
          entry:
            process.env.VITE_DEVTOOLS_REMOTE_URL ||
            (process.env.NODE_ENV === 'production'
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
});
