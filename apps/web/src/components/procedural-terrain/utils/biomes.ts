/* ═══════════════════════════════════════════════════════════════
 *  Biome Classification & Variation
 * ═══════════════════════════════════════════════════════════════ */

import type { BiomeType, BiomeConfig } from '../types';
import { REGION_SCALE, MAX_HEIGHT } from '../constants';
import { shiftColor } from './color';

/** Classify the biome at world coordinates (wx, wz) */
export function getBiome(
  biomeN: (x: number, y: number) => number,
  tempN: (x: number, y: number) => number,
  wx: number, wz: number,
  cityFreq: number,
): BiomeType {
  const bv = biomeN(wx * 0.008, wz * 0.008);
  const tv = tempN(wx * 0.006, wz * 0.006);

  // City zones — controlled by cityFrequency config
  const cv = biomeN(wx * 0.012 + 500, wz * 0.012 + 500);
  if (cv > 0.28 - cityFreq * 0.25 && Math.abs(bv) < 0.55 && Math.abs(tv) < 0.55) return 'city';

  // Village zones — rural settlements, appear in moderate terrain
  const vv = biomeN(wx * 0.015 + 700, wz * 0.015 + 700);
  if (vv > 0.35 && Math.abs(bv) < 0.3 && tv > -0.2 && tv < 0.3) return 'village';

  // Swamp — low-lying wet areas
  if (bv < -0.15 && bv > -0.30 && tv < 0.1 && tv > -0.3) return 'swamp';

  if (bv > 0.35) return tv > 0 ? 'mountains' : 'tundra';
  if (bv < -0.30) return tv > 0.1 ? 'desert' : 'ocean';
  if (bv > 0.05) return 'forest';
  return 'plains';
}

/**
 * Generates a per-column varied BiomeConfig — each voxel column in a biome
 * has slightly different heightBase, heightScale, colours, etc.
 */
export function getVariedBiome(
  base: BiomeConfig,
  wx: number, wz: number,
  regionN: (x: number, y: number) => number,
  variation: number,
  roughness: number,
): BiomeConfig {
  if (variation < 0.01) return base;

  const r1 = regionN(wx * REGION_SCALE + 200, wz * REGION_SCALE + 200);
  const r2 = regionN(wx * REGION_SCALE + 400, wz * REGION_SCALE + 400);
  const r3 = regionN(wx * REGION_SCALE + 600, wz * REGION_SCALE + 600);

  const v = variation;
  const heightScaleShift = r1 * v * 4;
  const heightBaseShift = Math.round(r2 * v * 2);
  const waterLevelShift = Math.round(r3 * v * 1.5);

  const hueShift = r1 * v * 0.06;
  const satShift = r2 * v * 0.12;
  const litShift = r3 * v * 0.08;

  return {
    name: base.name,
    heightScale: Math.max(1, base.heightScale + heightScaleShift + roughness * 3),
    heightBase: Math.max(1, Math.min(MAX_HEIGHT - 10, base.heightBase + heightBaseShift)),
    waterLevel: Math.max(0, Math.min(12, base.waterLevel + waterLevelShift)),
    colors: {
      top: shiftColor(base.colors.top, hueShift, satShift, litShift),
      mid: shiftColor(base.colors.mid, hueShift * 0.5, satShift * 0.5, litShift * 0.7),
      bottom: shiftColor(base.colors.bottom, hueShift * 0.3, satShift * 0.3, litShift * 0.5),
      accent: shiftColor(base.colors.accent, hueShift * 0.8, satShift, litShift),
      water: shiftColor(base.colors.water, hueShift * 0.4, satShift * 0.3, litShift * 0.3),
    },
  };
}
