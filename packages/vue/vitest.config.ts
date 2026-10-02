import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // CI runs every package's suites at once on four cores: there a cold
    // first render or a CPU-bound test can pass the 5 s default. The limit
    // only has to catch a hang.
    testTimeout: 15_000,
    environment: 'jsdom',
    globals: true,
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
