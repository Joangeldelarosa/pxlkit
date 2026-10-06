// @vitest-environment node
/**
 * Contract of the published package (dist/, built by `npm run build`): the
 * manifest, the bundle, the declarations and the stylesheet.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { describe, expect, it } from 'vitest';

const packageDir = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (file: string) => readFileSync(join(packageDir, file), 'utf8');
const manifest = JSON.parse(read('package.json')) as {
  name: string;
  type: string;
  sideEffects: string[];
  files: string[];
  peerDependencies: Record<string, string>;
  dependencies: Record<string, string>;
  exports: Record<string, { types: string; default: string } | string>;
};
const entry = manifest.exports['.'] as { types: string; default: string };

/** Bare module specifiers a file imports or re-exports from. */
function bareSpecifiers(source: string): Set<string> {
  return new Set(Array.from(source.matchAll(/(?:from|import)\s*['"]([^'"./][^'"]*)['"]/g), (m) => m[1]!));
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

/** Minified bytes an application keeps for an entry: the kit and its dependencies, Vue left out. */
async function keptBytes(imports: string): Promise<number> {
  const result = await build({
    stdin: { contents: imports.replace('KIT', JSON.stringify(resolve(packageDir, entry.default))), resolveDir: packageDir, loader: 'js' },
    bundle: true,
    minify: true,
    format: 'esm',
    write: false,
    logLevel: 'silent',
    external: ['vue'],
    define: { 'process.env.NODE_ENV': '"production"' },
  });
  return result.outputFiles[0]!.contents.length;
}

// Loads and server-renders the built bundle: seconds of work on a busy CI
// runner, past the 5 s default.
describe('@pxlkit/ui-kit-vue package', { timeout: 30_000 }, () => {
  it('is an ES module package with Vue 3.5+ as its only peer', () => {
    expect(manifest.type).toBe('module');
    expect(manifest.peerDependencies).toEqual({ vue: '^3.5.0' });
    expect(manifest.dependencies['@pxlkit/ui-kit-core']).toBeDefined();
    expect(manifest.files).toEqual(['dist', 'styles.css']);
    expect(manifest.sideEffects).toEqual(['*.css']);
  });

  it('bundles nothing it depends on', () => {
    const allowed = new Set(['vue', ...Object.keys(manifest.dependencies)]);
    for (const specifier of bareSpecifiers(read(entry.default))) {
      expect(allowed, specifier).toContain(specifier.split('/').slice(0, specifier.startsWith('@') ? 2 : 1).join('/'));
    }
  });

  it('ships declarations whose every relative import resolves', () => {
    const typesDir = resolve(packageDir, dirname(entry.types));
    expect(existsSync(resolve(packageDir, entry.types))).toBe(true);
    for (const file of filesUnder(typesDir).filter((f) => f.endsWith('.d.ts'))) {
      const source = readFileSync(file, 'utf8');
      for (const [, specifier] of source.matchAll(/(?:from|import)\s*['"](\.{1,2}\/[^'"]+)['"]/g)) {
        const target = resolve(dirname(file), specifier!);
        const candidates = [`${target}.d.ts`, target.replace(/\.js$/, '.d.ts')];
        expect(candidates.some(existsSync), `${file} → ${specifier}`).toBe(true);
      }
    }
  });

  it('ships a stylesheet that brings the shared theme and its own class names', () => {
    expect(manifest.exports['./styles.css']).toBe('./styles.css');
    const css = read('styles.css');
    expect(css).toContain('@import "@pxlkit/ui-kit-core/styles.css";');
    expect(css).toContain('@source "./dist";');
  });

  it('lets an application keep only the components it imports', async () => {
    // A component that nothing imports goes: the render-function ones are
    // pure definitions too (`/* @__PURE__ */ defineComponent(…)`), which
    // bundlers that do not follow Vue's own annotation (esbuild, webpack)
    // kept with everything they reach — over 18% of the kit for one button.
    const all = await keptBytes('import * as kit from KIT; console.log(kit);');
    const one = await keptBytes('import { PixelButton } from KIT; console.log(PixelButton);');
    expect(one / all).toBeLessThan(0.05);
  });

  it('renders from the built bundle', async () => {
    const { createSSRApp, h } = await import('vue');
    const { renderToString } = await import('vue/server-renderer');
    const kit = (await import(resolve(packageDir, entry.default))) as Record<string, unknown>;
    const html = await renderToString(
      createSSRApp({ render: () => h(kit.PixelButton as never, { tone: 'cyan' }, () => 'Built') }),
    );
    expect(html).toContain('<button');
    expect(html).toContain('text-retro-cyan');
    expect(html).toContain('Built');
  });
});
