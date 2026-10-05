// @vitest-environment node
/**
 * Contract of the published package (dist/, built by `npm run build`): the
 * manifest, the ES modules an application's bundler tree-shakes, the
 * CommonJS file, the client boundary every file opens with and the
 * declarations.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { createElement, type ComponentType, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (file: string) => readFileSync(join(packageDir, file), 'utf8');
const manifest = JSON.parse(read('package.json')) as {
  type: string;
  sideEffects: string[];
  files: string[];
  main: string;
  module: string;
  types: string;
  exports: Record<string, unknown>;
  peerDependencies: Record<string, string>;
  dependencies: Record<string, string>;
};

/** Every JavaScript file of the build. */
function builtFiles(dir = join(packageDir, 'dist')): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return builtFiles(path);
    return /\.c?js$/.test(name) ? [path] : [];
  });
}

/** Bare module specifiers a file imports, re-exports or requires. */
function bareSpecifiers(source: string): Set<string> {
  return new Set(
    Array.from(source.matchAll(/(?:\bfrom|\bimport|\brequire\()\s*['"]([^'"./][^'"]*)['"]/g), (m) => m[1]!),
  );
}

/** Minified bytes an application keeps of the kit's own code for an entry (its dependencies left out). */
async function keptBytes(imports: string): Promise<number> {
  const entry = JSON.stringify(join(packageDir, manifest.module));
  const result = await build({
    stdin: { contents: imports.replace('KIT', entry), resolveDir: packageDir, loader: 'js' },
    bundle: true,
    minify: true,
    format: 'esm',
    write: false,
    logLevel: 'silent',
    plugins: [
      {
        name: 'dependencies',
        setup(bundler) {
          bundler.onResolve({ filter: /^[^./]/ }, (args) => ({ path: args.path, external: true }));
        },
      },
    ],
  });
  return result.outputFiles[0]!.contents.length;
}

type Kit = Record<string, ComponentType<{ tone?: string; children?: ReactNode }>>;

const renderButton = (kit: Kit) => renderToString(createElement(kit.PixelButton!, { tone: 'cyan' }, 'Built'));

// Bundles and loads the build: seconds of work on a busy CI runner, past the
// 5 s default.
describe('@pxlkit/ui-kit package', { timeout: 60_000 }, () => {
  it('is an ES module package whose only side effects are its stylesheets', () => {
    expect(manifest.type).toBe('module');
    expect(manifest.sideEffects).toEqual(['*.css']);
    expect(manifest.exports['.']).toEqual({
      types: './dist/index.d.ts',
      import: './dist/index.js',
      require: './dist/index.cjs',
    });
    expect(manifest.exports['./styles.css']).toBe('./styles.css');
    expect([manifest.module, manifest.main, manifest.types]).toEqual([
      './dist/index.js',
      './dist/index.cjs',
      './dist/index.d.ts',
    ]);
  });

  it('opens every file of the build with the client boundary, as its first statement', () => {
    for (const file of builtFiles()) {
      expect(readFileSync(file, 'utf8').startsWith("'use client';\n"), relative(packageDir, file)).toBe(true);
    }
  });

  it('imports React and its own dependencies only', () => {
    const allowed = new Set([...Object.keys(manifest.peerDependencies), ...Object.keys(manifest.dependencies)]);
    for (const file of builtFiles()) {
      for (const specifier of bareSpecifiers(readFileSync(file, 'utf8'))) {
        const name = specifier.split('/').slice(0, specifier.startsWith('@') ? 2 : 1).join('/');
        expect(allowed, `${relative(packageDir, file)} → ${specifier}`).toContain(name);
      }
    }
  });

  it('lets an application keep only the components it imports', async () => {
    // One ES module per source module, the code they share in chunks.
    expect(builtFiles().filter((file) => file.endsWith('.js')).length).toBeGreaterThan(100);
    const all = await keptBytes('import * as kit from KIT; console.log(kit);');
    const one = await keptBytes('import { PixelButton } from KIT; console.log(PixelButton);');
    const few = await keptBytes(
      'import { PixelButton, PixelCard, PixelInput, PixelModal, PixelTabs, PixelBadge } from KIT; console.log(PixelButton, PixelCard, PixelInput, PixelModal, PixelTabs, PixelBadge);',
    );
    // A single bundle kept over 90% of the kit for one component.
    expect(one / all).toBeLessThan(0.05);
    expect(few / all).toBeLessThan(0.25);
    expect(one).toBeLessThan(few);
  });

  it('renders from the built ES modules and from the CommonJS file', async () => {
    const esm = (await import(pathToFileURL(join(packageDir, manifest.module)).href)) as Kit;
    const cjs = createRequire(import.meta.url)(join(packageDir, manifest.main)) as Kit;
    for (const kit of [esm, cjs]) {
      const html = renderButton(kit);
      expect(html).toContain('<button');
      expect(html).toContain('text-retro-cyan');
      expect(html).toContain('Built');
    }
  });

  it('ships the declarations of its entry point in one file', () => {
    expect(existsSync(join(packageDir, manifest.types))).toBe(true);
    const types = read(manifest.types);
    expect(types).toMatch(/\bPixelButton\b/);
    expect(types).not.toMatch(/from\s+['"]\.{1,2}\//);
  });
});
