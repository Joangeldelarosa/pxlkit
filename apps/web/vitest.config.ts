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
    // 15s default. Procedural-terrain integration tests (highway / tunnel /
    // bridge / water generation) routinely run 2-5s and the default 5000ms
    // leaves no headroom for Node-20 CI variance — `highway.test.ts > water
    // is rendered under bridge` hit 5198ms on the GitHub Actions Node 20
    // matrix while passing locally and on Node 22. 15000ms gives ~3x buffer
    // without masking genuinely hung tests.
    testTimeout: 15000,
    hookTimeout: 15000,
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
