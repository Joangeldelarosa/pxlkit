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
