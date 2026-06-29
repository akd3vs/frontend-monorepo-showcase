import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      outDirs: './dist',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        Button: resolve(__dirname, 'src/components/Button/index.ts'),
        Card: resolve(__dirname, 'src/components/Card/index.ts'),
        Table: resolve(__dirname, 'src/components/Table/index.ts'),
        Skeleton: resolve(__dirname, 'src/components/Skeleton/index.ts'),
        ErrorBoundary: resolve(__dirname, 'src/components/ErrorBoundary/index.ts'),
        theme: resolve(__dirname, 'src/theme/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const dir = format === 'es' ? 'esm' : 'cjs';
        const ext = format === 'es' ? 'js' : 'cjs';
        return `${dir}/${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@frontend-monorepo-showcase/design-tokens',
        /^@frontend-monorepo-showcase\/design-tokens\//,
      ],
      output: {
        preserveModules: false,
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
});
