import { defineConfig } from 'vitest/config';
import path from 'path';

const pkg = (name: string) => path.resolve(__dirname, '../../packages', name, 'src');

export default defineConfig({
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    // Procedural-terrain integration tests (highway / tunnel / bridge / water
    // generation) are CPU-bound: 2-5s on an idle runner. The default 5000ms
    // left no headroom for Node-20 CI variance — `highway.test.ts > water is
    // rendered under bridge` hit 5198ms on the GitHub Actions Node 20 matrix
    // — and 15000ms no longer does either: CI's test step also runs the Vue
    // and Angular UI kits' parity suites in parallel, which took the bridge
    // tests to 15-18s on a 4-core machine. 60000ms keeps a margin without
    // letting a hung test run for long.
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@pxlkit/core': pkg('core'),
      '@pxlkit/gamification': pkg('gamification'),
      '@pxlkit/feedback': pkg('feedback'),
      '@pxlkit/social': pkg('social'),
      '@pxlkit/weather': pkg('weather'),
      '@pxlkit/effects': pkg('effects'),
      '@pxlkit/ui': pkg('ui'),
      '@pxlkit/ui-kit': pkg('ui-kit'),
      '@pxlkit/parallax': pkg('parallax'),
      '@pxlkit/voxel': pkg('voxel'),
    },
  },
});
