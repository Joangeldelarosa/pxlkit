import { test, expect } from '@playwright/test';
import { loadWorld, readDebugApi } from '../_fixtures/world';

test.describe('window.__pxlTerrain debug API', () => {
  test('is installed when ?debug=1', async ({ page }) => {
    await loadWorld(page, { seed: 42, renderDistance: 4, settleMs: 1500 });
    const exists = await page.evaluate(() => typeof (window as any).__pxlTerrain);
    expect(exists).toBe('object');
  });

  test('exposes seed/camera/chunkCount', async ({ page }) => {
    await loadWorld(page, { seed: 555, renderDistance: 4, settleMs: 1500 });
    const info = await readDebugApi(page);
    expect(info.seed).toBe(555);
    expect(info.cacheSize).toBeGreaterThan(0);
    expect(info.camera.position).toHaveLength(3);
  });

  test('sampleBiome is deterministic for same (wx, wz)', async ({ page }) => {
    await loadWorld(page, { seed: 42, renderDistance: 4, settleMs: 1500 });
    const ok = await page.evaluate(() => {
      const api = (window as any).__pxlTerrain;
      const a = api.sampleBiome(100, 100);
      const b = api.sampleBiome(100, 100);
      return a.biome === b.biome
          && a.height === b.height
          && a.waterLevel === b.waterLevel;
    });
    expect(ok).toBe(true);
  });

  test('isReady() is true after settle', async ({ page }) => {
    await loadWorld(page, { seed: 42, renderDistance: 4, settleMs: 1500 });
    const ready = await page.evaluate(() => (window as any).__pxlTerrain.isReady());
    expect(ready).toBe(true);
  });

  test('setOverlay toggles overlays', async ({ page }) => {
    await loadWorld(page, { seed: 42, renderDistance: 4, settleMs: 1500 });
    const before = await page.evaluate(() => (window as any).__pxlTerrain.getOverlays().grid);
    await page.evaluate(() => (window as any).__pxlTerrain.setOverlay('grid', true));
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => (window as any).__pxlTerrain.getOverlays().grid);
    expect(before).toBe(false);
    expect(after).toBe(true);
  });
});
