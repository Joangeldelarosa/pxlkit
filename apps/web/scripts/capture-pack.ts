/* ═══════════════════════════════════════════════════════════════
 *  capture-pack — multimodal QA workflow.
 *
 *  Walks every icon in a pack via /dev/inspector and writes one
 *  screenshot per icon (multi-resolution + grid overlay) to a
 *  gitignored artifacts folder, plus a manifest.json. Feed the
 *  folder to a multimodal model (or eyeball it) to find silhouette,
 *  alignment, scaling and contrast defects, then fix the icon source.
 *
 *  Requires the dev server running:  npm run dev   (port 3333)
 *  Run:  npx tsx scripts/capture-pack.ts gamification
 *        npx tsx scripts/capture-pack.ts feedback --sizes 16,32,64 --bg checker
 * ═══════════════════════════════════════════════════════════════ */

import { chromium, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { inspectorUrl, type Background } from '../tests/visual/_fixtures/inspector';

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function waitReady(page: Page): Promise<void> {
  await page.waitForSelector('[data-inspector-root][data-ready="true"]', { timeout: 90_000 });
  await page.waitForTimeout(120);
}

async function main(): Promise<void> {
  const pack = process.argv[2];
  if (!pack || pack.startsWith('--')) {
    console.error(
      'usage: tsx scripts/capture-pack.ts <packId> [--base http://localhost:3333] [--sizes 16,32,64] [--grid 1] [--bg dark|light|checker] [--out <dir>]',
    );
    process.exit(1);
  }

  const base = arg('base', 'http://localhost:3333');
  const sizes = arg('sizes', '16,32,64')
    .split(',')
    .map((n) => parseInt(n, 10))
    .filter((n) => Number.isFinite(n));
  const grid = arg('grid', '1') === '1';
  const bg = arg('bg', 'dark') as Background;
  const outDir = arg('out', path.resolve(__dirname, '..', '.artifacts', 'inspector', pack));
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto(base + inspectorUrl({ pack, icon: null }), { timeout: 90_000 });
  await waitReady(page);
  const names: string[] = await page.$$eval('[data-testid="contact-sheet"] img', (imgs) =>
    imgs.map((img) => img.getAttribute('aria-label') ?? '').filter(Boolean),
  );

  if (names.length === 0) {
    console.error(`no icons found for pack "${pack}". Is the dev server up at ${base}?`);
    await browser.close();
    process.exit(1);
  }

  const manifest: Array<{ icon: string; file: string }> = [];
  for (const icon of names) {
    await page.goto(base + inspectorUrl({ pack, icon, sizes, grid, bg }), { timeout: 90_000 });
    await waitReady(page);
    const file = path.join(outDir, `${icon}.png`);
    await page.locator('[data-testid="inspector-stage"]').screenshot({ path: file });
    manifest.push({ icon, file });
    console.log(`captured ${pack}/${icon}`);
  }

  writeFileSync(
    path.join(outDir, 'manifest.json'),
    JSON.stringify({ pack, base, sizes, grid, bg, count: manifest.length, icons: manifest }, null, 2),
  );
  console.log(`\n✓ ${manifest.length} icons captured to ${outDir}`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
