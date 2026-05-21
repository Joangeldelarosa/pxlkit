import { test, expect } from '@playwright/test';
import { loadWorld } from '../_fixtures/world';

test.describe('Highway features', () => {
  test('autopista is reachable via teleport', async ({ page }) => {
    await loadWorld(page, {
      seed: 42,
      teleport: 'highway',
      renderDistance: 6,
      overlays: ['highway'],
      settleMs: 3000,
      readyTimeoutMs: 45_000,
    });
    const hi = await page.evaluate(() => {
      const api = (window as any).__pxlTerrain;
      const cam = api.getCamera();
      const VOXEL_SIZE = 0.5;
      const wx = cam.position[0] / VOXEL_SIZE;
      const wz = cam.position[2] / VOXEL_SIZE;
      return api.sampleHighway(Math.round(wx), Math.round(wz));
    });
    expect(hi.hi).not.toBeNull();
  });

  test('tunnel mouth is reachable in non-mountain biomes (Phase 1 broadening)', async ({ page }) => {
    await loadWorld(page, {
      seed: 200,
      teleport: 'tunnel',
      renderDistance: 6,
      overlays: ['tunnel', 'highway'],
      settleMs: 3000,
      readyTimeoutMs: 60_000,
    });
    const t = await page.evaluate(() => {
      const api = (window as any).__pxlTerrain;
      const cam = api.getCamera();
      const VOXEL_SIZE = 0.5;
      const wx = Math.round(cam.position[0] / VOXEL_SIZE);
      const wz = Math.round(cam.position[2] / VOXEL_SIZE);
      const isTunnel = api.isTunnelAt(wx, wz);
      const biome = api.sampleBiome(wx, wz);
      return { isTunnel, biome: biome.biome };
    });
    expect(t.isTunnel).toBe(true);
  });

  test('bridge over water is reachable via teleport', async ({ page }) => {
    await loadWorld(page, {
      seed: 314,
      teleport: 'bridge',
      renderDistance: 6,
      overlays: ['bridge', 'highway'],
      settleMs: 3000,
      readyTimeoutMs: 60_000,
    });
    const isBridge = await page.evaluate(() => {
      const api = (window as any).__pxlTerrain;
      const cam = api.getCamera();
      const VOXEL_SIZE = 0.5;
      const wx = Math.round(cam.position[0] / VOXEL_SIZE);
      const wz = Math.round(cam.position[2] / VOXEL_SIZE);
      return api.sampleHighway(wx, wz).isBridge;
    });
    expect(isBridge).toBe(true);
  });
});
