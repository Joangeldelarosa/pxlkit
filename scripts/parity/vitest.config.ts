import { defineConfig } from 'vitest/config';

// The harness serialises and drives DOM, so its own tests run in jsdom.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['__tests__/**/*.test.ts'],
  },
});
