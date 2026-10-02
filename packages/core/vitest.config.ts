import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // CI runs every package's suites at once on four cores: there a cold
    // first render or a CPU-bound test can pass the 5 s default. The limit
    // only has to catch a hang.
    testTimeout: 15_000,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/__tests__/**', 'src/**/*.stories.tsx', 'src/types.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
