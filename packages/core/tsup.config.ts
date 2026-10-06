import { defineConfig } from 'tsup';

export default defineConfig({
  // `index` = framework-agnostic API + React components.
  // `vanilla` = the framework-agnostic API alone (no React anywhere in its
  // module graph) — what @pxlkit/vue, @pxlkit/angular and the icon packs use.
  entry: ['src/index.ts', 'src/vanilla.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
});
