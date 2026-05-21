/* ═══════════════════════════════════════════════════════════════
 *  Highway Geometry — globally-consistent road-level + tunnel detection
 *
 *  These functions are deterministic in (wx, wz) alone — they do NOT
 *  depend on chunk-local state. That means adjacent chunks asking
 *  about the same world cell get the SAME answer, eliminating the
 *  2-voxel road-level jumps and chunk-clipped portal arches that the
 *  previous chunk-local implementations produced.
 *
 *  Consumed by:
 *    - generation/chunk.ts (Phase 1 portal detection + Phase 4 road level)
 *    - debug/teleport.ts   (find nearest highway / tunnel / bridge)
 * ═══════════════════════════════════════════════════════════════ */

import type { BiomeType } from '../types';
import type { TerrainSamplerInputs } from './terrain-sampler';
import { sampleTerrain } from './terrain-sampler';
import { getInterHighwayInfo, TUNNEL_HEIGHT } from '../city/layout';
import type { InterHighwayInfo } from '../city/layout';

/**
 * How much taller than the road the terrain must be before a cell is
 * promoted from "road cut" to "tunnel". 8 voxels above the road surface
 * means the terrain visibly clips through the road, so a tunnel reads
 * better than a half-carved trench.
 */
export const TUNNEL_TRIGGER_DELTA = 8;

/**
 * Number of voxels sampled along the highway axis when computing road
 * level. Must match the EXT_RANGE in `generateChunkData`'s legacy path
 * so that the noise-only road level matches what the chunk computes.
 */
export const HIGHWAY_SAMPLE_RANGE = 16;
const HIGHWAY_SAMPLE_STEP = 2;

/**
 * Biomes (× continent contexts) that admit tunnels. Plains/forest get
 * tunnels when terrain genuinely clips through; tundra only on highlands;
 * desert/swamp/ocean/city/village never tunnel.
 */
export function allowsTunnelInBiome(biome: BiomeType, continent: string | null): boolean {
  if (biome === 'mountains') return true;
  if (biome === 'forest') return true;
  if (biome === 'plains') return true;
  if (biome === 'tundra' && continent === 'highlands') return true;
  return false;
}

/**
 * Compute the road surface Y at (wx, wz) by sampling terrain along the
 * highway axis ±HIGHWAY_SAMPLE_RANGE. Deterministic in (wx, wz, hi)
 * alone — no chunk-local data. Returns the same value regardless of
 * which chunk asks → smooth cross-chunk roads.
 *
 * Returns -1 if the cell is not on a highway.
 */
export function computeRoadLevelAt(
  s: TerrainSamplerInputs,
  wx: number,
  wz: number,
  hi: InterHighwayInfo | null = getInterHighwayInfo(wx, wz),
): number {
  if (!hi) return -1;

  let minH = Infinity;
  let maxWL = -Infinity;

  for (let d = -HIGHWAY_SAMPLE_RANGE; d <= HIGHWAY_SAMPLE_RANGE; d += HIGHWAY_SAMPLE_STEP) {
    const sx = wx + (hi.onX ? d : 0);
    const sz = wz + (hi.onZ ? d : 0);
    const t = sampleTerrain(s, sx, sz);
    if (t.height < minH) minH = t.height;
    if (t.waterLevel > maxWL) maxWL = t.waterLevel;
  }

  if (!isFinite(minH)) return -1;
  return Math.max(maxWL + 2, minH);
}

/**
 * Determine if the highway at (wx, wz) is inside a tunnel — i.e. the
 * terrain bulges enough above the road surface to need carving.
 *
 * Cross-chunk-stable: calling this from any chunk gives the same answer
 * for the same (wx, wz). This is the fix for portal arches that
 * silently truncated at chunk borders.
 */
export function isTunnelAt(
  s: TerrainSamplerInputs,
  wx: number,
  wz: number,
  hi: InterHighwayInfo | null = getInterHighwayInfo(wx, wz),
): boolean {
  if (!hi) return false;

  const onRoad = (Math.abs(hi.distFromCenterX) <= hi.hwHalfWX && hi.onX)
              || (Math.abs(hi.distFromCenterZ) <= hi.hwHalfWZ && hi.onZ);
  if (!onRoad && !hi.isShoulder) return false;

  const t = sampleTerrain(s, wx, wz);

  // City biome handles its own roads; ocean cells bridge over water.
  if (t.biome === 'city') return false;

  if (!allowsTunnelInBiome(t.biome, t.continent)) return false;

  const roadLevel = computeRoadLevelAt(s, wx, wz, hi);
  if (roadLevel < 0) return false;

  return t.height > roadLevel + TUNNEL_HEIGHT + TUNNEL_TRIGGER_DELTA;
}

/**
 * Check if (wx, wz) is over water on a highway — i.e. needs bridge
 * geometry. Deterministic in (wx, wz). Used by bridge span detection.
 */
export function isOverWaterHighway(
  s: TerrainSamplerInputs,
  wx: number,
  wz: number,
  hi: InterHighwayInfo | null = getInterHighwayInfo(wx, wz),
): boolean {
  if (!hi) return false;
  const t = sampleTerrain(s, wx, wz);
  return t.height < t.waterLevel;
}
