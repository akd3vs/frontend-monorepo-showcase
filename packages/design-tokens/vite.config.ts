import { copyFileSync } from 'fs';
import { resolve } from 'path';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

/** Plugin to copy standalone CSS files to dist after build */
function copyCssPlugin() {
  return {
    name: 'copy-css',
    closeBundle() {
      const cssFiles = ['layers.css', 'tokens.css', 'dark.css', 'high-contrast.css'];
      for (const file of cssFiles) {
        copyFileSync(
          resolve(__dirname, 'src', file),
          resolve(__dirname, 'dist', file),
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
    }),
    copyCssPlugin(),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        colors: resolve(__dirname, 'src/colors.ts'),
        spacing: resolve(__dirname, 'src/spacing.ts'),
        typography: resolve(__dirname, 'src/typography.ts'),
        motion: resolve(__dirname, 'src/motion.ts'),
        elevation: resolve(__dirname, 'src/elevation.ts'),
        breakpoints: resolve(__dirname, 'src/breakpoints.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        const dir = format === 'es' ? 'esm' : 'cjs';
        const ext = format === 'es' ? 'js' : 'cjs';
        return `${dir}/${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: [],
    },
    cssCodeSplit: false,
    outDir: 'dist',
    emptyOutDir: true,
  },
});
