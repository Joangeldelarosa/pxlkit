/**
 * Contract of the published package (dist/, built by `npm run build`): the
 * manifest, the bundles and — above all — typings that hold for every
 * supported Vue version, not just the one the package is built with.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file: string) => readFileSync(join(packageDir, file), 'utf8');
const manifest = JSON.parse(read('package.json')) as {
  peerDependencies: Record<string, string>;
  dependencies: Record<string, string>;
  exports: Record<string, { import: { types: string; default: string }; require: { types: string; default: string } }>;
};

/** Module specifiers a file imports or re-exports from. */
function specifiers(source: string): Set<string> {
  return new Set(Array.from(source.matchAll(/(?:from|import|require\()\s*['"]([^'"./][^'"]*)['"]/g), (m) => m[1]!));
}

describe('@pxlkit/vue package', () => {
  it('depends on Vue ≥ 3.3 as a peer and on nothing but @pxlkit/core', () => {
    expect(manifest.peerDependencies).toEqual({ vue: '^3.3.0' });
    expect(Object.keys(manifest.dependencies)).toEqual(['@pxlkit/core']);
  });

  it('imports Vue and the React-free core entry only', () => {
    const { import: esm, require: cjs } = manifest.exports['.']!;
    for (const file of [esm.default, cjs.default, esm.types, cjs.types]) {
      expect(specifiers(read(file)), file).toEqual(new Set(['vue', '@pxlkit/core/vanilla']));
    }
  });

  it('types every component with the DefineComponent parameters Vue 3.3 already has', () => {
    for (const file of [manifest.exports['.']!.import.types, manifest.exports['.']!.require.types]) {
      const typings = read(file);
      for (const component of ['PxlKitIcon', 'AnimatedPxlKitIcon', 'ParallaxPxlKitIcon', 'PixelToast']) {
        expect(typings, `${file}: ${component}`).toMatch(new RegExp(`declare const ${component}: PxlComponent<`));
      }
      // Inferred component types name Vue-version-specific helpers (`PublicProps`
      // and the type parameters added after 3.3) — none may leak into the typings.
      const declarations = typings.replace(/\/\*\*[\s\S]*?\*\//g, '');
      expect(declarations).not.toContain('PublicProps');
      expect(declarations.match(/DefineComponent</g)).toHaveLength(1); // the PxlComponent alias itself
    }
  });
});
