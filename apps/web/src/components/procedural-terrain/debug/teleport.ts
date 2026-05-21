/* ═══════════════════════════════════════════════════════════════
 *  Teleport helpers — search the noise field for a target feature
 *
 *  Each helper performs a deterministic spiral search around an
 *  origin and returns the first world-space (wx, wz) that satisfies
 *  the predicate, plus a sensible Y for the camera to spawn at.
 *
 *  Pure functions over a TerrainSamplerInputs — no chunk cache needed.
 * ═══════════════════════════════════════════════════════════════ */

import type { TerrainSamplerInputs } from '../utils/terrain-sampler';
import { sampleTerrain } from '../utils/terrain-sampler';
import { getInterHighwayInfo, INTER_HW_SPACING } from '../city/layout';
import { isTunnelAt, isOverWaterHighway } from '../utils/highway-geom';
import { VOXEL_SIZE, MAX_HEIGHT } from '../constants';
import type { BiomeType } from '../types';
import type { TeleportTarget } from './url-params';

export interface TeleportResult {
  wx: number;
  wz: number;
  /** Recommended Y for camera (world units) — terrain height + clearance */
  worldY: number;
}

const SEARCH_STEP = 3; // voxel step; smaller = exhaustive but slower

/**
 * Spiral-scan around (originX, originZ) until predicate(wx, wz) is true.
 * Returns null if no match within `maxRadius` voxels.
 */
function spiralSearch(
  originX: number,
  originZ: number,
  maxRadius: number,
  predicate: (wx: number, wz: number) => boolean,
  step = SEARCH_STEP,
): { wx: number; wz: number } | null {
  if (predicate(originX, originZ)) return { wx: originX, wz: originZ };
  // Expanding rings (square shells)
  for (let r = step; r <= maxRadius; r += step) {
    // top and bottom edges
    for (let dx = -r; dx <= r; dx += step) {
      if (predicate(originX + dx, originZ + r)) return { wx: originX + dx, wz: originZ + r };
      if (predicate(originX + dx, originZ - r)) return { wx: originX + dx, wz: originZ - r };
    }
    // left and right edges (exclude corners already done)
    for (let dz = -r + step; dz <= r - step; dz += step) {
      if (predicate(originX + r, originZ + dz)) return { wx: originX + r, wz: originZ + dz };
      if (predicate(originX - r, originZ + dz)) return { wx: originX - r, wz: originZ + dz };
    }
  }
  return null;
}

function makeResult(
  s: TerrainSamplerInputs,
  wx: number,
  wz: number,
  clearanceVoxels = 4,
): TeleportResult {
  const t = sampleTerrain(s, wx, wz);
  const groundY = Math.max(t.height, t.waterLevel);
  return {
    wx, wz,
    worldY: (groundY + clearanceVoxels) * VOXEL_SIZE,
  };
}

/* ── Per-target search predicates ── */

export function findNearestHighway(
  s: TerrainSamplerInputs,
  originX: number, originZ: number,
  maxRadius = 1500,
): TeleportResult | null {
  // Prefer hitting a non-shoulder road cell
  const hit = spiralSearch(originX, originZ, maxRadius, (wx, wz) => {
    const hi = getInterHighwayInfo(wx, wz);
    return !!(hi && !hi.isShoulder);
  });
  return hit ? makeResult(s, hit.wx, hit.wz, 5) : null;
}

export function findNearestTunnel(
  s: TerrainSamplerInputs,
  originX: number, originZ: number,
  maxRadius = 3000,
): TeleportResult | null {
  const hit = spiralSearch(originX, originZ, maxRadius, (wx, wz) => isTunnelAt(s, wx, wz));
  return hit ? makeResult(s, hit.wx, hit.wz, 6) : null;
}

export function findNearestBridge(
  s: TerrainSamplerInputs,
  originX: number, originZ: number,
  maxRadius = 2500,
): TeleportResult | null {
  const hit = spiralSearch(originX, originZ, maxRadius, (wx, wz) => {
    const hi = getInterHighwayInfo(wx, wz);
    if (!hi) return false;
    return isOverWaterHighway(s, wx, wz, hi);
  });
  return hit ? makeResult(s, hit.wx, hit.wz, 6) : null;
}

export function findNearestBiome(
  s: TerrainSamplerInputs,
  originX: number, originZ: number,
  biome: BiomeType,
  maxRadius = 4000,
): TeleportResult | null {
  const hit = spiralSearch(originX, originZ, maxRadius, (wx, wz) => {
    return sampleTerrain(s, wx, wz).biome === biome;
  });
  return hit ? makeResult(s, hit.wx, hit.wz, 6) : null;
}

export function findDeepWater(
  s: TerrainSamplerInputs,
  originX: number, originZ: number,
  minDepth = 6,
  maxRadius = 4000,
): TeleportResult | null {
  const hit = spiralSearch(originX, originZ, maxRadius, (wx, wz) => {
    const t = sampleTerrain(s, wx, wz);
    return t.height < t.waterLevel - (minDepth - 1);
  });
  if (!hit) return null;
  // Spawn ABOVE the water, not on the seabed
  const t = sampleTerrain(s, hit.wx, hit.wz);
  return {
    wx: hit.wx, wz: hit.wz,
    worldY: (t.waterLevel + 5) * VOXEL_SIZE,
  };
}

export function findCoast(
  s: TerrainSamplerInputs,
  originX: number, originZ: number,
  maxRadius = 3000,
): TeleportResult | null {
  // "Coast" = land cell adjacent (within ±2 voxels) to a water cell, and
  // the land cell is plains/desert/forest.
  const hit = spiralSearch(originX, originZ, maxRadius, (wx, wz) => {
    const here = sampleTerrain(s, wx, wz);
    if (here.height < here.waterLevel) return false;
    if (here.biome !== 'plains' && here.biome !== 'desert' && here.biome !== 'forest') return false;
    // Check 4 cardinal neighbours at radius 2
    for (const [dx, dz] of [[2, 0], [-2, 0], [0, 2], [0, -2]] as const) {
      const n = sampleTerrain(s, wx + dx, wz + dz);
      if (n.height < n.waterLevel) return true;
    }
    return false;
  });
  return hit ? makeResult(s, hit.wx, hit.wz, 5) : null;
}

/* ── Dispatcher by URL param value ── */

export function findTeleportTarget(
  s: TerrainSamplerInputs,
  originX: number, originZ: number,
  target: TeleportTarget,
): TeleportResult | null {
  switch (target) {
    case 'highway':  return findNearestHighway(s, originX, originZ);
    case 'tunnel':   return findNearestTunnel(s, originX, originZ);
    case 'bridge':   return findNearestBridge(s, originX, originZ);
    case 'ocean':    return findDeepWater(s, originX, originZ);
    case 'coast':    return findCoast(s, originX, originZ);
    case 'mountain': return findNearestBiome(s, originX, originZ, 'mountains');
    case 'forest':   return findNearestBiome(s, originX, originZ, 'forest');
    case 'desert':   return findNearestBiome(s, originX, originZ, 'desert');
    case 'city':     return findNearestBiome(s, originX, originZ, 'city');
    case 'village':  return findNearestBiome(s, originX, originZ, 'village');
    default:         return null;
  }
}
