/* ═══════════════════════════════════════════════════════════════
 *  Inspector fixture for Playwright — the URL-driven screenshot
 *  surface for the /dev/inspector icon QA tool.
 *
 *  Unlike the voxel world (GPU, non-deterministic), the inspector
 *  renders pure SVG, so screenshots are reproducible and CAN run
 *  in CI.
 * ═══════════════════════════════════════════════════════════════ */

import type { Page, Locator } from '@playwright/test';

export type Background = 'checker' | 'dark' | 'light';
export type Appearance = 'palette' | 'tinted' | 'solid';
export type CollectionView = 'grid' | 'slider' | 'strip';

export interface InspectorSpec {
  /** Pack id (gamification | feedback | social | weather | ui | effects). */
  pack?: string;
  /** Icon name → single multi-resolution mode. Omit/null → collection. */
  icon?: string | null;
  /** Render sizes in px. */
  sizes?: number[];
  /** Pixel-grid overlay on/off. */
  grid?: boolean;
  /** Overlay color (hex). */
  gridColor?: string;
  /** Stage background. */
  bg?: Background;
  /** Color mode. */
  appearance?: Appearance;
  /** Tint/solid color (hex). */
  color?: string;
  /** Cell size (px) for collection views. */
  cell?: number;
  /** Collection layout: grid | slider | strip. */
  view?: CollectionView;
}

/** Build the deep-link URL for a given inspector state. */
export function inspectorUrl(spec: InspectorSpec = {}): string {
  const sp = new URLSearchParams();
  if (spec.pack) sp.set('pack', spec.pack);
  if (spec.icon) sp.set('icon', spec.icon);
  if (spec.sizes) sp.set('sizes', spec.sizes.join(','));
  if (spec.grid != null) sp.set('grid', spec.grid ? '1' : '0');
  if (spec.gridColor) sp.set('gridColor', spec.gridColor);
  if (spec.bg) sp.set('bg', spec.bg);
  if (spec.appearance) sp.set('appearance', spec.appearance);
  if (spec.color) sp.set('color', spec.color);
  if (spec.cell != null) sp.set('cell', String(spec.cell));
  if (spec.view) sp.set('view', spec.view);
  const qs = sp.toString();
  return qs ? `/dev/inspector?${qs}` : '/dev/inspector';
}

/** Navigate to an inspector state and wait until it has painted. */
export async function loadInspector(page: Page, spec: InspectorSpec = {}): Promise<void> {
  await page.goto(inspectorUrl(spec), { timeout: 90_000 });
  await page.waitForSelector('[data-inspector-root][data-ready="true"]', { timeout: 90_000 });
  await page.waitForTimeout(150); // layout/font settle
}

/** The stage element (the icons, without the controls chrome). */
export function stage(page: Page): Locator {
  return page.locator('[data-testid="inspector-stage"]');
}

/** Read every icon name in the current contact sheet (from stage img aria-labels). */
export async function readSheetIconNames(page: Page): Promise<string[]> {
  return page.$$eval('[data-testid="contact-sheet"] img', (imgs) =>
    imgs.map((img) => img.getAttribute('aria-label') ?? '').filter(Boolean),
  );
}

/** Screenshot the stage for a given icon state. */
export async function captureStage(page: Page, spec: InspectorSpec, path: string): Promise<void> {
  await loadInspector(page, spec);
  await stage(page).screenshot({ path });
}
