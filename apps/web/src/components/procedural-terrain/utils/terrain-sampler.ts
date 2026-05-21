/* ═══════════════════════════════════════════════════════════════
 *  Terrain Sampler — globally-consistent point queries
 *
 *  A pure-noise sampler that reproduces the exact terrain values
 *  `generateChunkData` would compute at any (wx, wz). Used by:
 *    - utils/highway-geom.ts (cross-chunk-stable tunnel detection)
 *    - debug/teleport.ts     (search for biome/feature locations)
 *    - debug/global.ts       (sampleBiome / sampleTerrain debug API)
 *    - Phase 4 cross-chunk highway smoothing
 *
 *  By centralising the noise composition formula here we guarantee
 *  identical results regardless of which subsystem asks.
 * ═══════════════════════════════════════════════════════════════ */

import type { BiomeType, ContinentType, WorldConfig } from '../types';
import { BIOMES, MAX_HEIGHT } from '../constants';
import { fbm } from './noise';
import { getBiome, getContinent, getVariedBiome } from './biomes';

export type NoiseFn = (x: number, y: number) => number;

export interface TerrainSamplerInputs {
  heightN: NoiseFn;
  detailN: NoiseFn;
  biomeN: NoiseFn;
  tempN: NoiseFn;
  regionN: NoiseFn;
  continentN?: NoiseFn;
  cfg: WorldConfig;
}

export interface TerrainPointInfo {
  biome: BiomeType;
  continent: ContinentType | null;
  /** Top-of-terrain Y in voxel units (0..MAX_HEIGHT). */
  height: number;
  /** Water level Y in voxel units, after continent waterOffset. */
  waterLevel: number;
}

/**
 * Sample biome + height + waterLevel at a single (wx, wz) using the same
 * formula `generateChunkData` uses. Pure noise — no chunk state.
 */
export function sampleTerrain(
  s: TerrainSamplerInputs,
  wx: number,
  wz: number,
): TerrainPointInfo {
  const biome = getBiome(s.biomeN, s.tempN, wx, wz, s.cfg.cityFrequency, s.continentN);
  const continent = s.continentN ? getContinent(s.continentN, wx, wz) : null;
  const base = BIOMES[biome];
  const varied = getVariedBiome(
    base, wx, wz, s.regionN,
    s.cfg.biomeVariation, s.cfg.terrainRoughness,
    s.continentN,
  );

  const h1 = fbm(s.heightN, wx * 0.02, wz * 0.02, 4, 2.0, 0.5);
  const det = s.detailN(wx * 0.08, wz * 0.08) * (0.2 + s.cfg.terrainRoughness * 0.3);

  let extra = 0;
  if (biome === 'mountains') {
    extra = Math.abs(fbm(s.detailN, wx * 0.015 + 200, wz * 0.015 + 200, 2))
          * (6 + s.cfg.terrainRoughness * 6);
  }

  const height = Math.max(
    0,
    Math.min(MAX_HEIGHT, Math.floor(varied.heightBase + (h1 + det) * varied.heightScale + extra)),
  );

  return { biome, continent, height, waterLevel: varied.waterLevel };
}
