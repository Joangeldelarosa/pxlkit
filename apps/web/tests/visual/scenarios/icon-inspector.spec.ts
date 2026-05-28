/* ═══════════════════════════════════════════════════════════════
 *  Visual regression for the /dev/inspector icon QA tool.
 *
 *  SVG output is deterministic, so these baselines are stable across
 *  machines and safe for CI (unlike the GPU voxel scenarios).
 * ═══════════════════════════════════════════════════════════════ */

import path from 'node:path';
import { test, expect } from '@playwright/test';
import { loadInspector, stage } from '../_fixtures/inspector';

const DEMO_DIR = path.resolve(__dirname, '..', '..', '..', '.artifacts', 'inspector', '_demo');

test.describe('icon inspector', () => {
  test('single icon: multi-resolution ladder with grid overlay', async ({ page }) => {
    await loadInspector(page, {
      pack: 'gamification',
      icon: 'trophy',
      sizes: [16, 32, 64, 128, 256],
      grid: true,
      bg: 'dark',
    });

    await expect(page.locator('[data-testid="multi-res-row"]')).toBeVisible();
    await expect(page.locator('[data-testid="icon-stage"]')).toHaveCount(5);
    await expect(page.locator('[data-testid="grid-overlay"]').first()).toBeVisible();
    await expect(stage(page)).toHaveScreenshot('trophy-multires-grid-dark.png');
  });

  test('single icon: grid overlay off on checker background', async ({ page }) => {
    await loadInspector(page, {
      pack: 'gamification',
      icon: 'trophy',
      sizes: [32, 64, 128],
      grid: false,
      bg: 'checker',
    });

    await expect(page.locator('[data-testid="grid-overlay"]')).toHaveCount(0);
    await expect(stage(page)).toHaveScreenshot('trophy-multires-nogrid-checker.png');
  });

  test('is an internal tool: no site chrome (navbar/footer)', async ({ page }) => {
    await loadInspector(page, { pack: 'gamification', icon: 'trophy' });
    await expect(page.locator('text=Star on GitHub')).toHaveCount(0);
    await expect(page.locator('footer')).toHaveCount(0);
  });

  test('collection · grid: renders at least 9 icons', async ({ page }) => {
    await loadInspector(page, { pack: 'gamification', icon: null, view: 'grid', bg: 'dark', cell: 48 });
    const grid = page.locator('[data-testid="contact-sheet"]');
    await expect(grid).toBeVisible();
    expect(await grid.locator('[data-testid="icon-stage"]').count()).toBeGreaterThanOrEqual(9);
  });

  test('collection · strip: whole collection in one band', async ({ page }) => {
    await loadInspector(page, { pack: 'gamification', icon: null, view: 'strip', bg: 'dark', cell: 48 });
    const strip = page.locator('[data-testid="icon-strip"]');
    await expect(strip).toBeVisible();
    expect(await strip.locator('[data-testid="icon-stage"]').count()).toBeGreaterThanOrEqual(9);
  });

  test('collection · slider: paginates the collection', async ({ page }) => {
    await loadInspector(page, { pack: 'gamification', icon: null, view: 'slider', bg: 'dark', cell: 48 });
    await expect(page.locator('[data-testid="icon-slider"]')).toBeVisible();
    await expect(page.locator('[data-testid="slider-page"]')).toBeVisible();
    const before = await page.locator('[data-testid="slider-page"]').textContent();
    await page.locator('[data-testid="slider-next"]').click();
    await expect(page.locator('[data-testid="slider-page"]')).not.toHaveText(before ?? '');
  });

  test('unknown icon shows a not-found message', async ({ page }) => {
    await loadInspector(page, { pack: 'gamification', icon: '___nope___' });
    await expect(page.locator('[data-testid="icon-missing"]')).toBeVisible();
  });

  test('demo: full-page captures for review', async ({ page }) => {
    await loadInspector(page, { pack: 'gamification', icon: 'trophy', sizes: [16, 32, 64, 128, 256], grid: true, bg: 'dark' });
    await page.screenshot({ path: path.join(DEMO_DIR, 'inspector-single-trophy.png'), fullPage: true });

    await loadInspector(page, { pack: 'gamification', icon: null, view: 'grid', bg: 'dark', cell: 48 });
    await page.screenshot({ path: path.join(DEMO_DIR, 'inspector-grid.png'), fullPage: true });

    await loadInspector(page, { pack: 'gamification', icon: null, view: 'strip', bg: 'dark', cell: 64 });
    await page.screenshot({ path: path.join(DEMO_DIR, 'inspector-strip.png'), fullPage: true });

    await loadInspector(page, { pack: 'gamification', icon: null, view: 'slider', bg: 'dark', cell: 64 });
    await page.screenshot({ path: path.join(DEMO_DIR, 'inspector-slider.png'), fullPage: true });
  });
});
