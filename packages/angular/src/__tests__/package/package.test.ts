/**
 * Contract of the published package: the manifest, the Angular Package
 * Format bundle (partially compiled, so any Angular 20+ linker can process
 * it), its typings and the tarball contents.
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as vanilla from '@pxlkit/core/vanilla';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (file: string) => readFileSync(join(packageDir, file), 'utf8');
const manifest = JSON.parse(read('package.json')) as {
  name: string;
  type: string;
  module: string;
  typings: string;
  sideEffects: boolean;
  exports: Record<string, unknown>;
  files: string[];
  peerDependencies: Record<string, string>;
  dependencies: Record<string, string>;
};
const bundle = read(manifest.module);
const typings = read(manifest.typings);

/** Module specifiers a file imports or re-exports from. */
function specifiers(source: string): string[] {
  return Array.from(source.matchAll(/^(?:import|export)\b[^'"]*from\s+'([^']+)'/gm), (m) => m[1]!).sort();
}

describe('@pxlkit/angular package', () => {
  it('maps its only entry point onto the APF bundle and typings', () => {
    expect(manifest.type).toBe('module');
    expect(manifest.sideEffects).toBe(false);
    expect(manifest.exports).toEqual({
      '.': { types: './dist/index.d.ts', default: './dist/fesm2022/pxlkit-angular.mjs' },
      './package.json': './package.json',
    });
    expect(`./${manifest.module.replace(/^\.\//, '')}`).toBe('./dist/fesm2022/pxlkit-angular.mjs');
    expect(`./${manifest.typings.replace(/^\.\//, '')}`).toBe('./dist/index.d.ts');
    expect(existsSync(join(packageDir, 'dist/fesm2022/pxlkit-angular.mjs.map'))).toBe(true);
  });

  it('depends on Angular as a peer and on nothing but @pxlkit/core', () => {
    expect(Object.keys(manifest.peerDependencies).sort()).toEqual(['@angular/common', '@angular/core']);
    expect(Object.keys(manifest.dependencies)).toEqual(['@pxlkit/core']);
  });

  it('ships partially compiled declarations that Angular 20+ can link', () => {
    expect(bundle).toContain('ɵɵngDeclareComponent');
    expect(bundle).not.toMatch(/ɵɵdefineComponent|ɵɵdefineDirective/); // full compilation is not publishable
    const minVersions = Array.from(bundle.matchAll(/minVersion: "(\d+)\.(\d+)\.(\d+)"/g), (m) => Number(m[1]));
    expect(minVersions.length).toBeGreaterThan(0);
    expect(Math.max(...minVersions)).toBeLessThanOrEqual(20);
  });

  it('imports Angular and the React-free core entry only', () => {
    expect(new Set(specifiers(bundle))).toEqual(new Set(['@angular/common', '@angular/core', '@pxlkit/core/vanilla']));
    expect(new Set(specifiers(typings))).toEqual(new Set(['@angular/core', '@pxlkit/core/vanilla']));
  });

  it('declares the four standalone components with their selectors', () => {
    for (const [name, selector] of [
      ['PxlKitIcon', 'pxl-icon'],
      ['AnimatedPxlKitIcon', 'pxl-animated-icon'],
      ['ParallaxPxlKitIcon', 'pxl-parallax-icon'],
      ['PixelToast', 'pxl-toast'],
    ]) {
      expect(typings).toMatch(new RegExp(`ɵɵComponentDeclaration<${name}, "${selector}", never, \\{[^\\n]*, true, never>`));
    }
  });

  it('exports the components and the whole @pxlkit/core/vanilla API', async () => {
    await import('@angular/compiler'); // links the partial declarations on import
    const api = await import('@pxlkit/angular');
    const components = ['AnimatedPxlKitIcon', 'ParallaxPxlKitIcon', 'PixelToast', 'PxlKitIcon'];
    expect(Object.keys(api).sort()).toEqual([...components, ...Object.keys(vanilla)].sort());
  });

  it('packs the bundle, typings, readme and licence — nothing else', () => {
    const [packed] = JSON.parse(
      execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
        cwd: packageDir,
        encoding: 'utf8',
        env: { ...process.env, npm_config_loglevel: 'silent' },
      }),
    ) as Array<{ files: Array<{ path: string }> }>;
    expect(packed!.files.map((file) => file.path).sort()).toEqual([
      'LICENSE',
      'README.md',
      'dist/fesm2022/pxlkit-angular.mjs',
      'dist/fesm2022/pxlkit-angular.mjs.map',
      'dist/index.d.ts',
      'package.json',
    ]);
  });
});
