/* ═══════════════════════════════════════════════════════════════
 *  Color Utilities — variation, hashing, HSL manipulation
 * ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';

const _vc = new THREE.Color();
const _bvc = new THREE.Color();

/** Fast deterministic hash for 3 ints → [0,1) */
export function hashCoord(x: number, y: number, z: number): number {
  let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1103515245);
  h = h ^ (h >>> 16);
  return ((h >>> 0) % 10000) / 10000;
}

/** Secondary hash for independent second axis of variation */
export function hashCoord2(x: number, y: number, z: number): number {
  let h = (x * 1911520717 + y * 2048419325 + z * 327664571) | 0;
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = h ^ (h >>> 13);
  return ((h >>> 0) % 10000) / 10000;
}

/**
 * Takes a base hex colour and applies per-voxel variation in H, S, L
 * so adjacent voxels look like the same material but not identical.
 *
 * @param base    Base hex colour (e.g. '#77BB44')
 * @param x,y,z   Voxel world coords (used as hash seed)
 * @param spread  Integer 1-20 — higher = more hue spread (default 6)
 * @param satVar  0-1 — max saturation jitter (default 0.06)
 * @param litVar  0-1 — max lightness jitter (default 0.08)
 */
export function varyColor(
  base: string, x: number, y: number, z: number,
  spread = 6, satVar = 0.06, litVar = 0.08,
): string {
  _vc.set(base);
  const hsl = { h: 0, s: 0, l: 0 };
  _vc.getHSL(hsl);
  const h1 = hashCoord(x, y, z);
  const h2 = hashCoord2(x, y, z);
  hsl.h += (h1 - 0.5) * (spread / 360);
  hsl.s = Math.max(0, Math.min(1, hsl.s + (h2 - 0.5) * satVar * 2));
  hsl.l = Math.max(0, Math.min(1, hsl.l + (h1 * 0.7 + h2 * 0.3 - 0.5) * litVar * 2));
  _vc.setHSL(hsl.h, hsl.s, hsl.l);
  return '#' + _vc.getHexString();
}

/** Shift a hex colour by HSL deltas */
export function shiftColor(hex: string, dh: number, ds: number, dl: number): string {
  _bvc.set(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  _bvc.getHSL(hsl);
  _bvc.setHSL(
    (hsl.h + dh + 1) % 1,
    Math.max(0, Math.min(1, hsl.s + ds)),
    Math.max(0, Math.min(1, hsl.l + dl)),
  );
  return '#' + _bvc.getHexString();
}
