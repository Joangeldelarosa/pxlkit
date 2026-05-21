/* ═══════════════════════════════════════════════════════════════
 *  World loader fixture for Playwright visual scenarios
 *
 *  Encapsulates:
 *   - Building the /explore URL with debug params
 *   - Navigating + waiting for world ready
 *   - Optional settling time before screenshot
 *
 *  Usage:
 *    import { loadWorld } from '../_fixtures/world';
 *    test('boats spawn on ocean', async ({ page }) => {
 *      await loadWorld(page, { seed: 100, teleport: 'ocean' });
 *      await expect(page).toHaveScreenshot('boats-ocean.png');
 *    });
 * ═══════════════════════════════════════════════════════════════ */

import type { Page } from '@playwright/test';

export type OverlayKind =
  | 'grid' | 'biome' | 'highway' | 'tunnel'
  | 'bridge' | 'water' | 'boats';

export type TeleportTarget =
  | 'highway' | 'tunnel' | 'bridge' | 'ocean' | 'coast'
  | 'mountain' | 'forest' | 'desert' | 'city' | 'village';

export interface WorldSpec {
  /** Seed for noise functions (default 42) */
  seed?: number;
  /** Force world mode */
  worldMode?: 'infinite' | 'finite';
  /** Small render distance speeds up generation (default: don't override) */
  renderDistance?: number;
  /** Teleport target — applied on world ready */
  teleport?: TeleportTarget;
  /** Pre-enable overlays */
  overlays?: OverlayKind[];
  /** Boat density override (0..1) */
  boatDensity?: number;
  /** Settle time after world ready before screenshot (ms) */
  settleMs?: number;
  /** Max time to wait for world ready (ms, default 30000) */
  readyTimeoutMs?: number;
  /** Camera position override (voxels) */
  camera?: { px: number; py: number; pz: number; rx?: number; ry?: number; rz?: number };
}

/**
 * Load a world via the deterministic URL surface and wait until
 * window.__pxlTerrain.isReady() returns true.
 *
 * Hides the welcome screen by triggering pointer lock — Playwright
 * navigates to the URL and waits, but the procedural-terrain main
 * component only renders the canvas behind the welcome overlay
 * until the user clicks. We synthesise a click to dismiss it.
 */
export async function loadWorld(page: Page, spec: WorldSpec = {}): Promise<void> {
  const params = new URLSearchParams();
  params.set('debug', '1');
  if (spec.seed != null) params.set('seed', String(spec.seed));
  if (spec.worldMode) params.set('worldMode', spec.worldMode);
  if (spec.renderDistance != null) params.set('renderDistance', String(spec.renderDistance));
  if (spec.teleport) params.set('teleport', spec.teleport);
  if (spec.overlays?.length) params.set('overlay', spec.overlays.join(','));
  if (spec.boatDensity != null) params.set('boatDensity', String(spec.boatDensity));
  if (spec.camera) {
    params.set('px', spec.camera.px.toFixed(1));
    params.set('py', spec.camera.py.toFixed(1));
    params.set('pz', spec.camera.pz.toFixed(1));
    if (spec.camera.rx != null) params.set('rx', spec.camera.rx.toFixed(4));
    if (spec.camera.ry != null) params.set('ry', spec.camera.ry.toFixed(4));
    if (spec.camera.rz != null) params.set('rz', spec.camera.rz.toFixed(4));
  }

  await page.goto(`/explore?${params.toString()}`, { timeout: 90_000 });

  // The /explore route is loaded via next/dynamic({ ssr: false }) so the
  // component bundle has to download + mount before the canvas exists.
  // Next.js dev cold-compile of this route can take 30-60s on first hit.
  // Subsequent tests reuse the compiled bundle so they're fast.
  await page.waitForSelector('canvas', { timeout: 90_000 });

  // Wait for window.__pxlTerrain to exist and isReady() to return true
  const timeout = spec.readyTimeoutMs ?? 60_000;
  await page.waitForFunction(
    () => !!(window as any).__pxlTerrain,
    null,
    { timeout: 30_000 },
  );
  await page.waitForFunction(
    () => !!(window as any).__pxlTerrain?.isReady(),
    null,
    { timeout },
  );

  // Dismiss the welcome screen programmatically — Playwright can't
  // trigger pointer-lock through a button click in headless mode.
  // The debug global exposes dismissWelcome() exactly for this.
  await page.evaluate(() => {
    const api = (window as { __pxlTerrain?: { dismissWelcome?: () => void } }).__pxlTerrain;
    if (api?.dismissWelcome) api.dismissWelcome();
  });
  await page.waitForTimeout(800);

  // Optional settle (let extra chunks fill in / boats spawn / etc.)
  if (spec.settleMs != null) {
    await page.waitForTimeout(spec.settleMs);
  }
}

/**
 * Convenience: take a screenshot of just the canvas (no UI chrome).
 */
export async function screenshotCanvas(page: Page, name: string) {
  const canvas = page.locator('canvas').first();
  return canvas.screenshot({ path: name });
}

/**
 * Read the debug global without throwing if it's not yet installed.
 */
export async function readDebugApi(page: Page): Promise<{
  seed: number;
  fps: number;
  cacheSize: number;
  camera: { position: [number, number, number]; rotation: [number, number, number] };
}> {
  return page.evaluate(() => {
    const api = (window as any).__pxlTerrain;
    if (!api) throw new Error('__pxlTerrain not installed');
    return {
      seed: api.getSeed(),
      fps: api.getFps(),
      cacheSize: api.getCacheSize(),
      camera: api.getCamera(),
    };
  });
}
