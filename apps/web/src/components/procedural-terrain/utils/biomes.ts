/* ═══════════════════════════════════════════════════════════════
 *  Biome Classification & Variation + Continent System
 *
 *  Includes intelligent transitions:
 *  - Smooth continent-boundary elevation blending (no cliff edges)
 *  - Minimum city biome size enforcement (no tiny 1-block "cities")
 *  - Cities cannot spawn below water level
 * ═══════════════════════════════════════════════════════════════ */

import type { BiomeType, BiomeConfig, ContinentType, ContinentProfile } from '../types';
import { REGION_SCALE, MAX_HEIGHT, CONTINENT_SCALE, CONTINENT_DETAIL_SCALE, CONTINENT_PROFILES, BIOMES } from '../constants';
import { shiftColor } from './color';
import { fbm } from './noise';

/* ═══════════════════════════════════════════════════════════════
 *  Continent Classification
 *
 *  Continents are the largest terrain feature — spanning hundreds
 *  of chunks. They control base elevation and biome distribution.
 * ═══════════════════════════════════════════════════════════════ */

/** Classify the continent type at world coordinates */
export function getContinent(
  continentN: (x: number, y: number) => number,
  wx: number, wz: number,
): ContinentType {
  // Use very low-frequency noise for massive landmass shapes
  const c1 = continentN(wx * CONTINENT_SCALE, wz * CONTINENT_SCALE);
  const c2 = continentN(wx * CONTINENT_SCALE + 1000, wz * CONTINENT_SCALE + 1000);
  const c3 = continentN(wx * CONTINENT_DETAIL_SCALE + 500, wz * CONTINENT_DETAIL_SCALE + 500);

  // Deep ocean regions
  if (c1 < -0.35) return 'archipelago';

  // High-elevation regions
  if (c1 > 0.45) {
    if (c2 > 0.2) return 'volcanic';
    return 'highlands';
  }

  // Mid-range regions: depends on secondary noise
  if (c1 > 0.15) {
    if (c2 > 0.25) return 'wilderness';
    if (c2 < -0.2 && c3 > 0) return 'metropolis';
    return 'highlands';
  }

  if (c1 > -0.1) {
    if (c2 > 0.15) return 'farmland';
    if (c2 < -0.15) return 'metropolis';
    return 'coastal';
  }

  // Low terrain
  if (c2 > 0.1) return 'wasteland';
  if (c2 < -0.2) return 'coastal';
  return 'archipelago';
}

/** Get the continent profile */
export function getContinentProfile(
  continentN: (x: number, y: number) => number,
  wx: number, wz: number,
): ContinentProfile {
  return CONTINENT_PROFILES[getContinent(continentN, wx, wz)];
}

/* ── Smooth territory transition helper ──
 *  At continent borders (where the type changes within a short distance),
 *  we sample multiple nearby points and blend their elevations. This
 *  eliminates the harsh cliff-like drops where two territories with
 *  different elevationBase/elevationScale values meet. */

/** Radius in voxels to sample for territory border blending */
const TERRITORY_BLEND_RADIUS = 12;
/** Number of sampling offsets for border detection */
const BLEND_OFFSETS: [number, number][] = [
  [0, 0],
  [-TERRITORY_BLEND_RADIUS, 0], [TERRITORY_BLEND_RADIUS, 0],
  [0, -TERRITORY_BLEND_RADIUS], [0, TERRITORY_BLEND_RADIUS],
];

/** Compute raw (un-blended) continent elevation for a specific profile */
function rawContinentElevation(
  continentN: (x: number, y: number) => number,
  wx: number, wz: number,
  profile: ContinentProfile,
): number {
  const elev1 = fbm(continentN, wx * 0.003, wz * 0.003, 3, 2.0, 0.5);
  const elev2 = fbm(continentN, wx * 0.008 + 300, wz * 0.008 + 300, 2, 2.0, 0.4);
  return profile.elevationBase + elev1 * profile.elevationScale * 8 + elev2 * profile.elevationScale * 3;
}

/**
 * Compute the continent-scale base elevation at a world position.
 * Uses neighborhood sampling to smoothly blend at territory boundaries —
 * prevents harsh cliff-like drops between adjacent continents.
 */
export function getContinentElevation(
  continentN: (x: number, y: number) => number,
  wx: number, wz: number,
): number {
  const centerType = getContinent(continentN, wx, wz);
  const centerProfile = CONTINENT_PROFILES[centerType];
  const centerElev = rawContinentElevation(continentN, wx, wz, centerProfile);

  // Quick check: if all neighbors are the same continent type, skip blending
  let needsBlend = false;
  for (let i = 1; i < BLEND_OFFSETS.length; i++) {
    const [dx, dz] = BLEND_OFFSETS[i];
    if (getContinent(continentN, wx + dx, wz + dz) !== centerType) {
      needsBlend = true;
      break;
    }
  }
  if (!needsBlend) return centerElev;

  // Blend: weighted average of this position's elevation using each neighbor's profile.
  // Center point gets higher weight to keep the core intact.
  let sum = centerElev * 3;
  let weight = 3;
  for (let i = 1; i < BLEND_OFFSETS.length; i++) {
    const [dx, dz] = BLEND_OFFSETS[i];
    const nProfile = getContinentProfile(continentN, wx + dx, wz + dz);
    // Evaluate what this position's elevation would be under the neighbor's profile
    const nElev = rawContinentElevation(continentN, wx, wz, nProfile);
    sum += nElev;
    weight += 1;
  }
  return sum / weight;
}

/* ═══════════════════════════════════════════════════════════════
 *  Biome Classification (continent-aware)
 *
 *  Includes:
 *  - Minimum city biome size: cities require a strong-enough noise
 *    signal in a wider area (low-frequency check) to prevent tiny
 *    1-2 block "micro-cities" from generating.
 *  - No cities below water: if continent elevation places the ground
 *    below the city water level, the city biome is rejected.
 * ═══════════════════════════════════════════════════════════════ */

/** Classify the biome at world coordinates, influenced by continent type */
export function getBiome(
  biomeN: (x: number, y: number) => number,
  tempN: (x: number, y: number) => number,
  wx: number, wz: number,
  cityFreq: number,
  continentN?: (x: number, y: number) => number,
): BiomeType {
  const bv = biomeN(wx * 0.008, wz * 0.008);
  const tv = tempN(wx * 0.006, wz * 0.006);

  // Get continent modifiers if available
  let cityMult = 1.0;
  let villageMult = 1.0;
  let continentType: ContinentType | null = null;

  if (continentN) {
    continentType = getContinent(continentN, wx, wz);
    const profile = CONTINENT_PROFILES[continentType];
    cityMult = profile.cityDensity;
    villageMult = profile.villageDensity;

    // Continent-forced biomes: archipelago forces ocean in low areas
    if (continentType === 'archipelago') {
      const elev = getContinentElevation(continentN, wx, wz);
      if (elev < 3) return 'ocean';
    }

    // Volcanic continents: force mountains in high areas
    if (continentType === 'volcanic') {
      if (bv > 0.1 || tv > 0.2) return 'mountains';
    }

    // Wasteland continents: mostly desert
    if (continentType === 'wasteland') {
      if (Math.abs(bv) < 0.4 && tv > -0.3) return 'desert';
    }
  }

  // City zones — controlled by cityFrequency config × continent multiplier
  const effectiveCityFreq = cityFreq * cityMult;
  if (effectiveCityFreq > 0.01) {
    const cv = biomeN(wx * 0.006 + 500, wz * 0.006 + 500);
    const cityThreshold = 0.12 - effectiveCityFreq * 0.25;
    if (cv > cityThreshold && Math.abs(bv) < 0.55 && Math.abs(tv) < 0.55) {
      // ── Minimum city size check ──
      // Use a lower-frequency sample to ensure the city patch is large enough.
      // Small noise pockets that barely cross the threshold produce tiny cities.
      // We require the low-freq city noise to also be above a stricter threshold.
      const cvLowFreq = biomeN(wx * 0.003 + 500, wz * 0.003 + 500);
      // 0.08 offset ensures the low-freq signal confirms a city patch at least
      // ~50 voxels across (0.003 freq × 50 ≈ one noise period); smaller patches
      // that only barely pass the high-freq check are filtered out.
      const MIN_CITY_SIZE_MARGIN = 0.08;
      if (cvLowFreq <= cityThreshold + MIN_CITY_SIZE_MARGIN) {
        // Not a large enough city patch — fall through to natural biome
      } else {
        // ── No cities below water ──
        // If continent elevation puts the ground below the default city water level,
        // reject city biome to prevent underwater/flooded city streets.
        if (continentN) {
          const cityElev = getContinentElevation(continentN, wx, wz);
          const cityWaterLevel = BIOMES.city.waterLevel +
            (continentType ? CONTINENT_PROFILES[continentType].waterOffset : 0);
          const estimatedGround = BIOMES.city.heightBase + cityElev * 0.3;
          if (estimatedGround < cityWaterLevel + 1) {
            // Ground would be below water — reject city, fall through to natural biome
          } else {
            return 'city';
          }
        } else {
          return 'city';
        }
      }
    }
  }

  // Village zones — rural settlements, modulated by continent
  const effectiveVillageThreshold = 0.35 - (villageMult - 1) * 0.12;
  const vv = biomeN(wx * 0.015 + 700, wz * 0.015 + 700);
  if (villageMult > 0.05 && vv > effectiveVillageThreshold && Math.abs(bv) < 0.3 && tv > -0.2 && tv < 0.3) return 'village';

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
 * Now also incorporates continent-level elevation and color tinting.
 */
export function getVariedBiome(
  base: BiomeConfig,
  wx: number, wz: number,
  regionN: (x: number, y: number) => number,
  variation: number,
  roughness: number,
  continentN?: (x: number, y: number) => number,
): BiomeConfig {
  // Start with region-level variation
  const r1 = regionN(wx * REGION_SCALE + 200, wz * REGION_SCALE + 200);
  const r2 = regionN(wx * REGION_SCALE + 400, wz * REGION_SCALE + 400);
  const r3 = regionN(wx * REGION_SCALE + 600, wz * REGION_SCALE + 600);

  const v = Math.max(variation, 0.01);

  // Continent-level modifiers
  let continentElevOffset = 0;
  let continentHueShift = 0;
  let continentSatShift = 0;
  let continentLitShift = 0;

  if (continentN) {
    const elev = getContinentElevation(continentN, wx, wz);
    continentElevOffset = elev;
    const profile = getContinentProfile(continentN, wx, wz);
    continentHueShift = profile.colorTint[0];
    continentSatShift = profile.colorTint[1];
    continentLitShift = profile.colorTint[2];
  }

  const heightScaleShift = r1 * v * 4;
  const heightBaseShift = Math.round(r2 * v * 2) + continentElevOffset;
  const waterLevelShift = Math.round(r3 * v * 1.5);

  const hueShift = r1 * v * 0.06 + continentHueShift;
  const satShift = r2 * v * 0.12 + continentSatShift;
  const litShift = r3 * v * 0.08 + continentLitShift;

  return {
    name: base.name,
    heightScale: Math.max(1, base.heightScale + heightScaleShift + roughness * 3),
    heightBase: Math.max(1, Math.min(MAX_HEIGHT - 10, base.heightBase + heightBaseShift)),
    waterLevel: Math.max(0, Math.min(20, base.waterLevel + waterLevelShift)),
    colors: {
      top: shiftColor(base.colors.top, hueShift, satShift, litShift),
      mid: shiftColor(base.colors.mid, hueShift * 0.5, satShift * 0.5, litShift * 0.7),
      bottom: shiftColor(base.colors.bottom, hueShift * 0.3, satShift * 0.3, litShift * 0.5),
      accent: shiftColor(base.colors.accent, hueShift * 0.8, satShift, litShift),
      water: shiftColor(base.colors.water, hueShift * 0.4, satShift * 0.3, litShift * 0.3),
    },
  };
}
