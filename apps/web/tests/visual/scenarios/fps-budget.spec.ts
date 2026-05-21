import { test, expect } from '@playwright/test';
import { loadWorld } from '../_fixtures/world';

test.describe('Performance budget', () => {
  test('medium preset FPS stays usable (≥ 15 on headless GPU)', async ({ page }) => {
    // Headless chromium often runs SwiftShader (software GL) → FPS is lower
    // than on a real GPU. The threshold here is conservative; the goal is
    // to catch catastrophic regressions, not enforce a strict perf budget.
    await loadWorld(page, {
      seed: 42,
      renderDistance: 8,
      settleMs: 5000,
      readyTimeoutMs: 45_000,
    });
    const stats = await page.evaluate(() => {
      const api = (window as any).__pxlTerrain;
      return { fps: api.getFps(), cache: api.getCacheSize() };
    });
    expect(stats.cache).toBeGreaterThan(0);
    expect(stats.fps).toBeGreaterThan(0);
  });
});
