/**
 * Contract of the published package: the manifest, the Angular Package
 * Format bundle (partially compiled, so any Angular 20+ linker can process
 * it), its typings, the stylesheet and the tarball contents.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (file: string) => readFileSync(join(packageDir, file), 'utf8');
const manifest = JSON.parse(read('package.json')) as {
  name: string;
  type: string;
  module: string;
  typings: string;
  sideEffects: string[];
  exports: Record<string, unknown>;
  files: string[];
  peerDependencies: Record<string, string>;
  dependencies: Record<string, string>;
};
const bundle = read(manifest.module);
const typings = read(manifest.typings);

/** Module specifiers a file imports or re-exports from. */
function specifiers(source: string): Set<string> {
  return new Set(Array.from(source.matchAll(/^(?:import|export)\b[^'"]*from\s+'([^']+)'/gm), (m) => m[1]!));
}

describe('@pxlkit/ui-kit-angular package', () => {
  it('maps its entry point onto the APF bundle and typings, plus the stylesheet', () => {
    expect(manifest.type).toBe('module');
    expect(manifest.sideEffects).toEqual(['*.css']);
    expect(manifest.exports).toEqual({
      '.': { types: './dist/index.d.ts', default: './dist/fesm2022/pxlkit-ui-kit-angular.mjs' },
      './styles.css': './styles.css',
      './package.json': './package.json',
    });
    expect(manifest.module).toBe('./dist/fesm2022/pxlkit-ui-kit-angular.mjs');
    expect(manifest.typings).toBe('./dist/index.d.ts');
    expect(existsSync(join(packageDir, 'dist/fesm2022/pxlkit-ui-kit-angular.mjs.map'))).toBe(true);
  });

  it('depends on Angular 20–22 as a peer', () => {
    // @angular/forms backs the form-control support (NG_VALUE_ACCESSOR).
    expect(manifest.peerDependencies).toEqual({
      '@angular/common': '>=20.0.0 <23.0.0',
      '@angular/core': '>=20.0.0 <23.0.0',
      '@angular/forms': '>=20.0.0 <23.0.0',
    });
    expect(manifest.dependencies['@pxlkit/ui-kit-core']).toBeDefined();
  });

  it('ships partially compiled declarations that Angular 20+ can link', () => {
    expect(bundle).toContain('ɵɵngDeclareComponent');
    expect(bundle).not.toMatch(/ɵɵdefineComponent|ɵɵdefineDirective/); // full compilation is not publishable
    const minVersions = Array.from(bundle.matchAll(/minVersion: "(\d+)\.(\d+)\.(\d+)"/g), (m) => Number(m[1]));
    expect(minVersions.length).toBeGreaterThan(0);
    expect(Math.max(...minVersions)).toBeLessThanOrEqual(20);
  });

  it('imports Angular and its own dependencies only', () => {
    const allowed = new Set(['@angular/common', '@angular/core', ...Object.keys(manifest.dependencies)]);
    for (const specifier of [...specifiers(bundle), ...specifiers(typings)]) {
      expect(allowed, specifier).toContain(specifier);
    }
  });

  it('ships a stylesheet that brings the shared theme and its own class names', () => {
    const css = read('styles.css');
    expect(css).toContain('@import "@pxlkit/ui-kit-core/styles.css";');
    expect(css).toContain('@source "./dist";');
  });

  it('renders from the built bundle on the server', async () => {
    await import('@angular/compiler'); // links the partial declarations on import
    const { Component, provideZonelessChangeDetection } = await import('@angular/core');
    const { bootstrapApplication } = await import('@angular/platform-browser');
    const { provideServerRendering, renderApplication } = await import('@angular/platform-server');
    const kit = (await import(pathToFileURL(join(packageDir, manifest.module)).href)) as Record<string, never>;

    @Component({
      selector: 'built-app',
      imports: [kit.PixelButton],
      template: '<button pxlButton tone="cyan">Built</button>',
    })
    class BuiltApp {}

    const html = await renderApplication(
      (context) =>
        bootstrapApplication(BuiltApp, { providers: [provideServerRendering(), provideZonelessChangeDetection()] }, context),
      { document: '<built-app></built-app>', url: 'http://localhost/', allowedHosts: ['localhost'] },
    );
    expect(html).toMatch(/<button[^>]*class="[^"]*text-retro-cyan/);
    expect(html).toMatch(/<span>Built(<!--[^>]*-->)*<\/span>/);
  });

  it('packs the bundle, typings, stylesheet, readme and licence — nothing else', () => {
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
      'dist/fesm2022/pxlkit-ui-kit-angular.mjs',
      'dist/fesm2022/pxlkit-ui-kit-angular.mjs.map',
      'dist/index.d.ts',
      'package.json',
      'styles.css',
    ]);
  });
});
