/**
 * Capture OG / Twitter / README hero images by screenshotting the live hero
 * from the dev (or preview) server.
 *
 * Usage:
 *   npm run dev   # in another terminal — http://localhost:3333
 *   npm run og:capture
 *
 * Output (in apps/web/public/):
 *   - og-image.png      1280×640   (OG meta image)
 *   - og-twitter.png    1200×630   (Twitter card)
 *   - readme-hero.png   1920×1080  (README hero image, larger framing)
 *
 * The script:
 *   1. opens the homepage at the target viewport
 *   2. waits for an icon (data-fi-id) to be present (= IconField hydrated)
 *   3. lets animations settle for ~1.5s
 *   4. screenshots the visible viewport (fullPage:false, so we get JUST the hero region by sizing the viewport to the hero height)
 */

import { chromium } from 'playwright';
import path from 'node:path';

const BASE_URL = process.env.PXLKIT_OG_URL ?? 'http://localhost:3333';

type Target = {
  name: string;
  width: number;
  height: number;
  out: string;
  /** Path appended to BASE_URL — defaults to /og (the curated brand frame). */
  path?: string;
  /** Selector that must be attached before screenshot. */
  waitFor?: string;
};

const TARGETS: Target[] = [
  // OG / Twitter / README hero — curated full-bleed brand frame
  { name: 'og-image',    width: 1280, height: 640,  out: 'public/og-image.png',    waitFor: '[data-testid="og-frame"]' },
  { name: 'og-twitter',  width: 1200, height: 630,  out: 'public/og-twitter.png',  waitFor: '[data-testid="og-frame"]' },
  { name: 'readme-hero', width: 1920, height: 1080, out: 'public/readme-hero.png', waitFor: '[data-testid="og-frame"]' },
  // App icons rendered from the /og/icon route. `any` = standard fill (icon
  // ~70% of canvas), `maskable` = icon ~52% of canvas (inside the 40% safe
  // zone Android uses when cropping into a circle/squircle/etc.).
  { name: 'icon-192',          width: 192, height: 192, out: 'public/icon-192.png',          path: '/og/icon?s=192',         waitFor: '[data-testid="og-icon"]' },
  { name: 'icon-512',          width: 512, height: 512, out: 'public/icon-512.png',          path: '/og/icon?s=512',         waitFor: '[data-testid="og-icon"]' },
  { name: 'icon-maskable-192', width: 192, height: 192, out: 'public/icon-maskable-192.png', path: '/og/icon?s=192&mask=1',  waitFor: '[data-testid="og-icon"]' },
  { name: 'icon-maskable-512', width: 512, height: 512, out: 'public/icon-maskable-512.png', path: '/og/icon?s=512&mask=1',  waitFor: '[data-testid="og-icon"]' },
  { name: 'apple-touch-icon',  width: 180, height: 180, out: 'public/apple-touch-icon.png',  path: '/og/icon?s=180',         waitFor: '[data-testid="og-icon"]' },
  // Small favicon PNG fallbacks for browsers that prefer PNG over SVG.
  { name: 'favicon-32x32',     width: 32,  height: 32,  out: 'public/favicon-32x32.png',     path: '/og/icon?s=32&small=1',  waitFor: '[data-testid="og-icon"]' },
  { name: 'favicon-16x16',     width: 16,  height: 16,  out: 'public/favicon-16x16.png',     path: '/og/icon?s=16&small=1',  waitFor: '[data-testid="og-icon"]' },
];

async function main() {
  const browser = await chromium.launch();
  try {
    for (const t of TARGETS) {
      const url = BASE_URL.replace(/\/$/, '') + (t.path ?? '/og');
      const ctx = await browser.newContext({
        viewport: { width: t.width, height: t.height },
        deviceScaleFactor: 2,
      });
      const page = await ctx.newPage();
      console.log(`→ ${t.name} (${t.width}×${t.height}) ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      if (t.waitFor) {
        await page.waitForSelector(t.waitFor, { state: 'attached', timeout: 15_000 });
      }
      // For /og, also wait for the frozen icon field to hydrate.
      if ((t.path ?? '/og') === '/og') {
        await page.waitForSelector('[data-fi-id]', { state: 'attached', timeout: 10_000 });
      }
      await page.waitForTimeout(700);
      const outAbs = path.resolve(process.cwd(), t.out);
      await page.screenshot({ path: outAbs, fullPage: false, type: 'png' });
      console.log(`✓ ${t.name} → ${outAbs}`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
