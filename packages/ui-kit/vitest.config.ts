import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // The shared core is read from source, as in the Vue and Angular kits'
    // suites, so a change to it needs no rebuild before the tests see it.
    alias: [
      {
        find: /^@pxlkit\/ui-kit-core$/,
        replacement: fileURLToPath(new URL('../ui-kit-core/src/index.ts', import.meta.url)),
      },
    ],
  },
  test: {
    // CI runs every package's suites at once on four cores: there a cold
    // first render or a CPU-bound test can pass the 5 s default. The limit
    // only has to catch a hang.
    testTimeout: 15_000,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
