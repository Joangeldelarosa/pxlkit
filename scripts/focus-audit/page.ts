/**
 * The page the focus audit drives: every example of the React kit's
 * manifests, bundled with the audit's side of the page (`probe.ts`), and the
 * kit's stylesheet compiled by Tailwind CSS as an application's build
 * compiles it.
 */
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * The page: the examples mount in `#audit-root`, between two buttons focus
 * starts and ends on. Motion is frozen, so two screenshots differ only by
 * focus: transitions and animations end at once, in their final state.
 */
const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Focus audit</title>
<link rel="stylesheet" href="site.css">
<style>
  *, *::before, *::after {
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    caret-color: transparent !important;
  }
  #audit-start, #audit-end { position: fixed; left: -400px; top: 0; }
  #audit-end { top: 60px; }
</style>
</head>
<body class="bg-retro-bg text-retro-text">
<button id="audit-start" type="button">start</button>
<div id="audit-root" style="padding: 24px; max-width: 1100px"></div>
<button id="audit-end" type="button">end</button>
<script src="client.js"></script>
</body>
</html>
`;

/** The manifests of the React kit, in the order the parity catalog lists them. */
async function manifests(kit: string): Promise<string[]> {
  const out: string[] = [];
  for (const category of await readdir(kit, { withFileTypes: true })) {
    if (!category.isDirectory() || category.name === '__tests__') continue;
    for (const file of await readdir(path.join(kit, category.name))) {
      if (file.endsWith('.manifest.ts')) out.push(path.join(kit, category.name, file));
    }
  }
  return out.sort();
}

/** Builds the page into `outDir`; the path of its HTML file. */
export async function buildPage(repoRoot: string, outDir: string): Promise<string> {
  const kit = path.join(repoRoot, 'packages/ui-kit/src');
  const core = path.join(repoRoot, 'packages/ui-kit-core/src');
  await mkdir(path.join(outDir, 'css'), { recursive: true });

  const list = await manifests(kit);
  const entry = [
    `import { startAudit } from ${JSON.stringify(path.join(here, 'probe'))};`,
    `import { PxlKitSurfaceProvider } from ${JSON.stringify(path.join(kit, 'overlay-foundation/PxlKitSurfaceProvider'))};`,
    ...list.map((file, i) => `import m${i} from ${JSON.stringify(file.replace(/\.ts$/, ''))};`),
    `startAudit([${list.map((_, i) => `m${i}`).join(', ')}], PxlKitSurfaceProvider);`,
  ].join('\n');
  await esbuild.build({
    stdin: { contents: entry, loader: 'tsx', resolveDir: here, sourcefile: 'focus-audit-entry.tsx' },
    outfile: path.join(outDir, 'client.js'),
    absWorkingDir: repoRoot,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'chrome120',
    jsx: 'automatic',
    // The core from source, as the kits' own suites read it.
    alias: { '@pxlkit/ui-kit-core': path.join(core, 'index.ts') },
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: { '.css': 'empty', '.png': 'dataurl', '.svg': 'dataurl' },
    logLevel: 'warning',
  });

  // An application's stylesheet (`@import "@pxlkit/ui-kit/styles.css"`, by
  // path wherever the output goes), over the kit's and the core's sources,
  // the examples' classes included. Tailwind detects no other source: its
  // base is a folder holding the stylesheet alone.
  const { default: postcss } = await import('postcss');
  const { default: tailwind } = await import('@tailwindcss/postcss');
  const from = path.join(outDir, 'css/entry.css');
  const stylesheet = [
    `@import ${JSON.stringify(path.join(repoRoot, 'packages/ui-kit/styles.css'))};`,
    `@source ${JSON.stringify(kit)};`,
    `@source ${JSON.stringify(core)};`,
  ].join('\n');
  await writeFile(from, stylesheet);
  const { css } = await postcss([tailwind({ base: path.dirname(from) })]).process(stylesheet, { from, to: path.join(outDir, 'site.css') });
  await writeFile(path.join(outDir, 'site.css'), css);

  const html = path.join(outDir, 'index.html');
  await writeFile(html, HTML);
  return html;
}
