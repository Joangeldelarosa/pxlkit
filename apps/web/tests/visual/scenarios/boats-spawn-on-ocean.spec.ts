import { test, expect } from '@playwright/test';
import { loadWorld } from '../_fixtures/world';

test.describe('Boats spawn over deep water', () => {
  test('archipelago seed shows at least one boat candidate cell', async ({ page }) => {
    await loadWorld(page, {
      seed: 100,
      teleport: 'ocean',
      boatDensity: 1.0,
      renderDistance: 6,
      settleMs: 6000,        // give boats up to 6s to spawn
      readyTimeoutMs: 45_000,
    });

    // Programmatic check: at least one cell in the cache has water depth >= 3
    const result = await page.evaluate(() => {
      const api = (window as any).__pxlTerrain;
      const cam = api.getCamera();
      const VOXEL_SIZE = 0.5;
      // Sample around camera
      let viableCells = 0;
      let bestDepth = 0;
      for (let dx = -60; dx <= 60; dx += 6) {
        for (let dz = -60; dz <= 60; dz += 6) {
          const wx = cam.position[0] / VOXEL_SIZE + dx;
          const wz = cam.position[2] / VOXEL_SIZE + dz;
          const b = api.sampleBiome(wx, wz);
          const depth = b.waterLevel - b.height;
          if (depth >= 3) {
            viableCells++;
            if (depth > bestDepth) bestDepth = depth;
          }
        }
      }
      return { viableCells, bestDepth, cacheSize: api.getCacheSize() };
    });

    expect(result.cacheSize).toBeGreaterThan(0);
    expect(result.viableCells).toBeGreaterThan(0);
    expect(result.bestDepth).toBeGreaterThanOrEqual(3);
  });
});
