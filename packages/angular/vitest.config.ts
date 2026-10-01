import { defineConfig } from 'vitest/config';

// Every suite runs the published bundle — `@pxlkit/angular` resolves to dist/
// (`npm run build` first) — whose partial declarations the JIT compiler links
// at runtime, as the Angular CLI links them at build time.
export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      // Measured on the bundle, reported on src/ through its source map.
      include: ['dist/fesm2022/*.mjs'],
      // No branch threshold: the compiler wraps every signal declaration in
      // an `ngDevMode` ternary whose production arm never runs under test.
      thresholds: {
        statements: 90,
        functions: 90,
        lines: 90,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'zoneless',
          environment: 'jsdom',
          include: ['src/__tests__/*.test.ts'],
          setupFiles: ['./src/__tests__/setup/zoneless.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'zone.js',
          environment: 'jsdom',
          include: ['src/__tests__/zone/*.test.ts'],
          setupFiles: ['./src/__tests__/setup/zone.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'ssr',
          environment: 'node',
          include: ['src/__tests__/ssr/*.test.ts'],
          setupFiles: ['./src/__tests__/setup/jit.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'package',
          environment: 'node',
          include: ['src/__tests__/package/*.test.ts'],
          // Runs npm and loads the built bundle through the JIT linker:
          // seconds of work on a busy CI runner, past the 5 s default.
          testTimeout: 30_000,
        },
      },
    ],
  },
});
