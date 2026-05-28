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

const BASE_URL = process.env.PXLKIT_OG_URL ?? 'http://localhost:3333/og';

const TARGETS: { name: string; width: number; height: number; out: string }[] = [
  { name: 'og-image',    width: 1280, height: 640,  out: 'public/og-image.png' },
  { name: 'og-twitter',  width: 1200, height: 630,  out: 'public/og-twitter.png' },
  { name: 'readme-hero', width: 1920, height: 1080, out: 'public/readme-hero.png' },
];

async function main() {
  const browser = await chromium.launch();
  try {
    for (const t of TARGETS) {
      const ctx = await browser.newContext({
        viewport: { width: t.width, height: t.height },
        deviceScaleFactor: 2,
      });
      const page = await ctx.newPage();
      console.log(`→ ${t.name} (${t.width}×${t.height}) loading…`);
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      // /og is the curated full-bleed frame (no chrome). Wait for it.
      await page.waitForSelector('[data-testid="og-frame"]', { state: 'attached', timeout: 15_000 });
      // Wait for icon field to hydrate so the frozen field is in place.
      await page.waitForSelector('[data-fi-id]', { state: 'attached', timeout: 10_000 });
      // Settle layout / font load.
      await page.waitForTimeout(1000);
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
