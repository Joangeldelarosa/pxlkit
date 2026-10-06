import { defineConfig } from 'tsup';

// The components hold state, effects and context: a React Server Component
// can only import them across a client boundary, so every file of the
// build starts with the directive. Helpers to call on the server come from
// `@pxlkit/ui-kit-core`.
const banner = { js: "'use client';" };

export default defineConfig([
  {
    // One ES module per source module, the code they share split into
    // chunks: with `sideEffects` in package.json, an application's bundler
    // keeps the modules it imports and drops the others whole —
    // `displayName` writes and compound components' statics included,
    // which a single file keeps alive.
    entry: [
      'src/**/*.{ts,tsx}',
      '!src/__tests__/**',
      '!src/**/*.{stories,examples}.tsx',
      '!src/**/*.manifest.ts',
      '!src/registry.generated.ts',
    ],
    format: ['esm'],
    splitting: true,
    dts: { entry: { index: 'src/index.tsx' } },
    // The CommonJS build below writes into the same folder at the same time.
    clean: ['!index.cjs'],
    external: ['react', 'react-dom'],
    banner,
  },
  {
    // CommonJS, which bundlers do not tree-shake: one file.
    entry: { index: 'src/index.tsx' },
    format: ['cjs'],
    external: ['react', 'react-dom'],
    banner,
  },
]);
