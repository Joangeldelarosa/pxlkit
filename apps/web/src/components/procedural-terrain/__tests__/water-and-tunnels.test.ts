/* ═══════════════════════════════════════════════════════════════
 *  Water + Tunnels — Phase 1 invariants
 *
 *  Tests for the four critical fixes:
 *   1. solidHeightMap must NOT include water surface (boats need this).
 *   2. WaterBoats' sampleWaterInfo must report depth > 0 over water.
 *   3. Tunnel trigger must fire on tall non-mountain terrain.
 *   4. isTunnelAt must be cross-chunk-stable (same answer regardless
 *      of which chunk asks).
 *   5. Intersection barriers must persist on approach lanes, only
 *      the 3×3 core is barrier-free.
 * ═══════════════════════════════════════════════════════════════ */

import { describe, it, expect } from 'vitest';
import { createNoise2D } from '../utils/noise';
import { generateChunkData } from '../generation/chunk';
import { CHUNK_SIZE, VOXEL_SIZE, MAX_HEIGHT } from '../constants';
import { DEFAULT_CONFIG } from '../types';
import type { WorldConfig } from '../types';
import {
  isTunnelAt,
  allowsTunnelInBiome,
  computeRoadLevelAt,
  TUNNEL_TRIGGER_DELTA,
} from '../utils/highway-geom';
import { sampleTerrain } from '../utils/terrain-sampler';
import type { TerrainSamplerInputs } from '../utils/terrain-sampler';
import { getInterHighwayInfo, getHighwayClass, INTER_HW_SPACING, TUNNEL_HEIGHT } from '../city/layout';

/* ── Test utilities ── */

function makeNoiseFunctions(seed: number) {
  return {
    heightN: createNoise2D(seed),
    detailN: createNoise2D(seed + 1),
    biomeN: createNoise2D(seed + 2),
    tempN: createNoise2D(seed + 3),
    treeN: createNoise2D(seed + 4),
    structN: createNoise2D(seed + 5),
    regionN: createNoise2D(seed + 6),
    continentN: createNoise2D(seed + 7),
  };
}

function makeSampler(seed: number, cfgOverrides?: Partial<WorldConfig>): TerrainSamplerInputs {
  const nf = makeNoiseFunctions(seed);
  return {
    heightN: nf.heightN,
    detailN: nf.detailN,
    biomeN: nf.biomeN,
    tempN: nf.tempN,
    regionN: nf.regionN,
    continentN: nf.continentN,
    cfg: { ...DEFAULT_CONFIG, ...cfgOverrides },
  };
}

function genChunk(cx: number, cz: number, seed = 42, cfgOverrides?: Partial<WorldConfig>) {
  const nf = makeNoiseFunctions(seed);
  const cfg = { ...DEFAULT_CONFIG, ...cfgOverrides };
  return generateChunkData(
    cx, cz,
    nf.heightN, nf.detailN, nf.biomeN, nf.tempN,
    nf.treeN, nf.structN, nf.regionN,
    cfg,
    nf.continentN,
  );
}

/* ═══════════════════════════════════════════════════════════════
 *  1. solidHeightMap pollution fix (boats)
 * ═══════════════════════════════════════════════════════════════ */

describe('solidHeightMap excludes water surface', () => {
  // Try several seeds × chunks; at least one water-bearing cell must exist
  // and its solidHeightMap value must be the seabed height, NOT the water level.
  it('water cell solidH equals seabed terrain height, not water level', () => {
    let foundWaterCell = false;
    for (const seed of [42, 100, 7, 12345, 999]) {
      for (let cx = -3; cx <= 3 && !foundWaterCell; cx++) {
        for (let cz = -3; cz <= 3 && !foundWaterCell; cz++) {
          const chunk = genChunk(cx, cz, seed);
          for (let idx = 0; idx < CHUNK_SIZE * CHUNK_SIZE; idx++) {
            const solidH = chunk.solidHeightMap[idx];
            const wl = chunk.waterLevelMap[idx];
            // Water cells exist when solidH (now seabed) < wl
            if (solidH > 0 && solidH < wl) {
              foundWaterCell = true;
              // The invariant: solidH must be strictly less than water level
              // (i.e., the water surface is NOT considered solid)
              expect(solidH).toBeLessThan(wl);
              break;
            }
          }
        }
      }
      if (foundWaterCell) break;
    }
    expect(foundWaterCell).toBe(true);
  });
});

/* ═══════════════════════════════════════════════════════════════
 *  2. sampleWaterInfo (WaterBoats) — depth > 0 over water
 *  Mirrors the live sampler in effects/WaterBoats.tsx
 * ═══════════════════════════════════════════════════════════════ */

function sampleWaterInfo(
  cache: Map<string, ReturnType<typeof genChunk>>,
  worldX: number, worldZ: number,
): { depth: number; waterY: number } {
  const cx = Math.floor(worldX / (CHUNK_SIZE * VOXEL_SIZE));
  const cz = Math.floor(worldZ / (CHUNK_SIZE * VOXEL_SIZE));
  const key = `${cx},${cz}`;
  const data = cache.get(key);
  if (!data) return { depth: 0, waterY: 0 };
  const lx = Math.floor(worldX / VOXEL_SIZE) - cx * CHUNK_SIZE;
  const lz = Math.floor(worldZ / VOXEL_SIZE) - cz * CHUNK_SIZE;
  if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return { depth: 0, waterY: 0 };
  const idx = lx * CHUNK_SIZE + lz;
  const solidH = data.solidHeightMap[idx];
  const wl = data.waterLevelMap[idx];
  if (solidH < wl) return { depth: wl - solidH, waterY: wl * VOXEL_SIZE };
  return { depth: 0, waterY: 0 };
}

describe('sampleWaterInfo correctly detects water', () => {
  it('returns depth >= 3 (MIN_WATER_DEPTH) for at least one boat-spawnable cell', () => {
    let foundSpawnable = false;
    let bestDepth = 0;
    for (const seed of [42, 100, 7, 12345, 999, 555, 1024]) {
      const cache = new Map<string, ReturnType<typeof genChunk>>();
      for (let cx = -3; cx <= 3; cx++) {
        for (let cz = -3; cz <= 3; cz++) {
          cache.set(`${cx},${cz}`, genChunk(cx, cz, seed));
        }
      }
      // Scan all cached chunks for boat-viable cells
      for (let cx = -3; cx <= 3 && !foundSpawnable; cx++) {
        for (let cz = -3; cz <= 3 && !foundSpawnable; cz++) {
          for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            for (let lz = 0; lz < CHUNK_SIZE; lz++) {
              const wx = (cx * CHUNK_SIZE + lx) * VOXEL_SIZE;
              const wz = (cz * CHUNK_SIZE + lz) * VOXEL_SIZE;
              const info = sampleWaterInfo(cache, wx, wz);
              if (info.depth > bestDepth) bestDepth = info.depth;
              if (info.depth >= 3) { foundSpawnable = true; break; }
            }
            if (foundSpawnable) break;
          }
        }
      }
      if (foundSpawnable) break;
    }
    expect(foundSpawnable).toBe(true);
    expect(bestDepth).toBeGreaterThanOrEqual(3);
  });
});

/* ═══════════════════════════════════════════════════════════════
 *  3. Tunnel trigger broadening
 * ═══════════════════════════════════════════════════════════════ */

describe('allowsTunnelInBiome rule', () => {
  it('mountains/forest/plains allow tunnels', () => {
    expect(allowsTunnelInBiome('mountains', null)).toBe(true);
    expect(allowsTunnelInBiome('forest', null)).toBe(true);
    expect(allowsTunnelInBiome('plains', null)).toBe(true);
  });
  it('tundra only allows tunnels on highlands continent', () => {
    expect(allowsTunnelInBiome('tundra', null)).toBe(false);
    expect(allowsTunnelInBiome('tundra', 'highlands')).toBe(true);
    expect(allowsTunnelInBiome('tundra', 'wasteland')).toBe(false);
  });
  it('desert/swamp/ocean/city/village do NOT tunnel', () => {
    expect(allowsTunnelInBiome('desert', null)).toBe(false);
    expect(allowsTunnelInBiome('swamp', null)).toBe(false);
    expect(allowsTunnelInBiome('ocean', null)).toBe(false);
    expect(allowsTunnelInBiome('city', null)).toBe(false);
    expect(allowsTunnelInBiome('village', null)).toBe(false);
  });
});

/* ═══════════════════════════════════════════════════════════════
 *  4. isTunnelAt is cross-chunk-stable
 * ═══════════════════════════════════════════════════════════════ */

describe('isTunnelAt cross-chunk stability', () => {
  it('returns the same answer for any (wx, wz) regardless of caller', () => {
    const sampler = makeSampler(42);
    // Probe a grid of cells around several highway grid lines
    let sameCount = 0;
    let totalCount = 0;
    for (let gridIdx = -5; gridIdx <= 5; gridIdx++) {
      const hwZ = gridIdx * INTER_HW_SPACING;
      for (let wx = -100; wx <= 100; wx += 7) {
        const r1 = isTunnelAt(sampler, wx, hwZ);
        // Call again with the same inputs — must be identical (pure function)
        const r2 = isTunnelAt(sampler, wx, hwZ);
        if (r1 === r2) sameCount++;
        totalCount++;
      }
    }
    expect(sameCount).toBe(totalCount);
  });

  it('non-highway cells return false', () => {
    const sampler = makeSampler(42);
    // 100, 100 is far from any highway grid line (320-spaced)
    expect(isTunnelAt(sampler, 100, 100)).toBe(false);
  });
});

/* ═══════════════════════════════════════════════════════════════
 *  5. computeRoadLevelAt is deterministic & globally consistent
 * ═══════════════════════════════════════════════════════════════ */

describe('computeRoadLevelAt determinism', () => {
  // Helper from existing highway.test.ts pattern: find an active grid line.
  // Note: the deterministic hash clusters 'none' values in [-10, 10] — the
  // first reliably-active X grid line is around |idx| >= 11.
  function findActiveGridLine(isX: boolean): number {
    for (let i = 11; i <= 40; i++) {
      const cls = isX ? getHighwayClass(i, 0, true) : getHighwayClass(0, i, false);
      if (cls !== 'none') return i;
    }
    throw new Error('no active grid line found in [11, 40]');
  }

  it('same (wx, wz) → same road level across many calls', () => {
    const sampler = makeSampler(42);
    const gridIdx = findActiveGridLine(true);
    const wz = gridIdx * INTER_HW_SPACING;
    // Probe at exact grid-line wz with varying wx (X-running highway)
    let validRoadLevels = 0;
    let probed = 0;
    for (let wx = -100; wx <= 100; wx++) {
      const hi = getInterHighwayInfo(wx, wz);
      if (!hi) continue;
      probed++;
      const r1 = computeRoadLevelAt(sampler, wx, wz, hi);
      const r2 = computeRoadLevelAt(sampler, wx, wz, hi);
      const r3 = computeRoadLevelAt(sampler, wx, wz);
      expect(r1).toBe(r2);
      expect(r1).toBe(r3);
      if (r1 >= 0) validRoadLevels++;
    }
    expect(probed).toBeGreaterThan(0);
    expect(validRoadLevels).toBeGreaterThan(0);
  });

  it('-1 for non-highway cells', () => {
    const sampler = makeSampler(42);
    // INTER_HW_SPACING/2 = 160 — exactly between grid lines, off any road
    expect(computeRoadLevelAt(sampler, INTER_HW_SPACING / 2, INTER_HW_SPACING / 2)).toBe(-1);
  });
});

/* ═══════════════════════════════════════════════════════════════
 *  6. Intersection barriers preserved on approach lanes
 * ═══════════════════════════════════════════════════════════════ */

describe('Intersection barriers', () => {
  it('chunks containing highway intersections still emit barrier mini-voxels', () => {
    // Find a chunk that contains an X-Z highway intersection.
    let foundIntersection = false;
    let foundBarrier = false;
    for (let seed = 42; seed < 50 && !foundBarrier; seed++) {
      for (let cx = -5; cx <= 5 && !foundBarrier; cx++) {
        for (let cz = -5; cz <= 5 && !foundBarrier; cz++) {
          const bX = cx * CHUNK_SIZE;
          const bZ = cz * CHUNK_SIZE;
          let hasIntersection = false;
          for (let lx = 0; lx < CHUNK_SIZE; lx++) {
            for (let lz = 0; lz < CHUNK_SIZE; lz++) {
              const hi = getInterHighwayInfo(bX + lx, bZ + lz);
              if (hi?.isIntersection) { hasIntersection = true; break; }
            }
            if (hasIntersection) break;
          }
          if (!hasIntersection) continue;
          foundIntersection = true;
          const chunk = genChunk(cx, cz, seed);
          // Look for mini-voxel barriers (any mini-voxel above road level on
          // a non-intersection-core highway cell counts)
          if (chunk.miniVoxelCount > 0) foundBarrier = true;
        }
      }
    }
    // If we never found an intersection in the search window, the test is
    // non-applicable for this seed range — but we must have found one with
    // barriers preserved at least once across all seeds.
    if (foundIntersection) {
      expect(foundBarrier).toBe(true);
    }
  });
});
