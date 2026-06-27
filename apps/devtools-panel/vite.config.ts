import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { ports } from '../../ports.config';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'devtools_panel',
      filename: 'remoteEntry.js',
      exposes: {
        './DevtoolsWidget': './src/DevtoolsWidget.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: ports.devtoolsPanel,
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
