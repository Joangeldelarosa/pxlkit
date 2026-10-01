import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const at = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // The examples import the package by name, exactly as an application
    // does; in tests that name points at the sources.
    // The shared core is read from source too, so a change to it needs no
    // rebuild before the suites see it.
    alias: [
      { find: /^@pxlkit\/ui-kit-vue$/, replacement: at('./src/index.ts') },
      { find: /^@pxlkit\/ui-kit-core$/, replacement: at('../ui-kit-core/src/index.ts') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/__tests__/**'],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});
