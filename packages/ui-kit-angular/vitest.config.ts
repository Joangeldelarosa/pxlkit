import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { angularJit } from './tools/vite-angular-jit';

const at = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// The suites run the sources, compiled for JIT by ./tools/vite-angular-jit;
// the package suite checks the ng-packagr build in dist/.
export default defineConfig({
  plugins: [angularJit({ tsconfig: at('./tsconfig.spec.json') })],
  resolve: {
    // The examples import the package by name, exactly as an application
    // does; in tests that name points at the sources.
    // The shared core is read from source too, so a change to it needs no
    // rebuild before the suites see it.
    alias: [
      { find: /^@pxlkit\/ui-kit-angular$/, replacement: at('./src/public-api.ts') },
      { find: /^@pxlkit\/ui-kit-core$/, replacement: at('../ui-kit-core/src/index.ts') },
    ],
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/lib/**'],
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
          include: ['src/__tests__/*.test.ts', 'src/__tests__/*/*.test.ts'],
          exclude: ['src/__tests__/{ssr,package,zone}/**'],
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
