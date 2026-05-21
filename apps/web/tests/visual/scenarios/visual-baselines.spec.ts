/* ═══════════════════════════════════════════════════════════════
 *  Visual baselines — capture canonical screenshots
 *
 *  Uses page.screenshot() directly (instead of toHaveScreenshot()
 *  which expects stabilization). The 3D scene is continuously
 *  rendering (clouds, chunks streaming, day/night, boats moving),
 *  so we cannot wait for "pixel stability"; we just capture the
 *  scene after the world is ready and save the PNG.
 *
 *  Output goes to __snapshots__/ for manual inspection. Compare
 *  visually across runs to catch regressions.
 * ═══════════════════════════════════════════════════════════════ */

import { test, expect } from '@playwright/test';
import path from 'node:path';
import { loadWorld } from '../_fixtures/world';

const SNAP_DIR = path.join(__dirname, '..', '__snapshots__');

test.describe('Visual baselines', () => {
  test('plains baseline @ seed 42', async ({ page }) => {
    await loadWorld(page, { seed: 42, renderDistance: 6, settleMs: 3000 });
    const buf = await page.screenshot({ animations: 'disabled', timeout: 30_000, fullPage: false });
    expect(buf.byteLength).toBeGreaterThan(1000);
    // Write to snapshots dir for manual inspection
    const fs = await import('node:fs');
    fs.mkdirSync(SNAP_DIR, { recursive: true });
    fs.writeFileSync(path.join(SNAP_DIR, 'plains-seed42.png'), buf);
  });

  test('debug overlay grid + biome', async ({ page }) => {
    await loadWorld(page, {
      seed: 42, renderDistance: 6,
      overlays: ['grid', 'biome'],
      settleMs: 3000,
    });
    const buf = await page.screenshot({ animations: 'disabled', timeout: 30_000, fullPage: false });
    expect(buf.byteLength).toBeGreaterThan(1000);
    const fs = await import('node:fs');
    fs.mkdirSync(SNAP_DIR, { recursive: true });
    fs.writeFileSync(path.join(SNAP_DIR, 'overlay-grid-biome.png'), buf);
  });

  test('highway teleport visual', async ({ page }) => {
    await loadWorld(page, {
      seed: 42, teleport: 'highway',
      renderDistance: 6,
      overlays: ['highway'],
      settleMs: 4000,
      readyTimeoutMs: 45_000,
    });
    const buf = await page.screenshot({ animations: 'disabled', timeout: 30_000, fullPage: false });
    expect(buf.byteLength).toBeGreaterThan(1000);
    const fs = await import('node:fs');
    fs.mkdirSync(SNAP_DIR, { recursive: true });
    fs.writeFileSync(path.join(SNAP_DIR, 'highway-teleport.png'), buf);
  });

  test('ocean teleport with boats', async ({ page }) => {
    await loadWorld(page, {
      seed: 100, teleport: 'ocean',
      boatDensity: 1.0, renderDistance: 6,
      settleMs: 7000,
      readyTimeoutMs: 45_000,
    });
    const buf = await page.screenshot({ animations: 'disabled', timeout: 30_000, fullPage: false });
    expect(buf.byteLength).toBeGreaterThan(1000);
    const fs = await import('node:fs');
    fs.mkdirSync(SNAP_DIR, { recursive: true });
    fs.writeFileSync(path.join(SNAP_DIR, 'ocean-with-boats.png'), buf);
  });
});
