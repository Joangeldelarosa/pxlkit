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
    // CI runs every package's suites at once on four cores: there a cold
    // first render or a CPU-bound test can pass the 5 s default. The limit
    // only has to catch a hang.
    testTimeout: 15_000,
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
