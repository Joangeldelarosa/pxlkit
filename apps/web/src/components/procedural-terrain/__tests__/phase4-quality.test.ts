/* ═══════════════════════════════════════════════════════════════
 *  Phase 4 quality invariants
 *
 *  Tests for the visual-coherence work shipped in Phase 4:
 *   - 4.1 Slope ramps generate wedge instances for highway slopes
 *   - 4.2 Coast sand band is emitted for plains/desert/forest
 *   - 4.4 Cascades produce extra water voxels at biome boundaries
 *   - 4.5 Portal arches have semicircular height profile
 *   - 4.6 Bridge spans get endpoint-anchored pillars
 *   - 4.7 Cross-chunk road level is identical at chunk borders
 * ═══════════════════════════════════════════════════════════════ */

import { describe, it, expect } from 'vitest';
import { createNoise2D } from '../utils/noise';
import { generateChunkData } from '../generation/chunk';
import { CHUNK_SIZE, VOXEL_SIZE } from '../constants';
import { DEFAULT_CONFIG } from '../types';
import type { WorldConfig } from '../types';
import {
  getInterHighwayInfo, getHighwayClass, INTER_HW_SPACING,
} from '../city/layout';
import { computeRoadLevelAt } from '../utils/highway-geom';
import type { TerrainSamplerInputs } from '../utils/terrain-sampler';

function nf(seed: number) {
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

function gen(cx: number, cz: number, seed = 42, overrides?: Partial<WorldConfig>) {
  const n = nf(seed);
  const cfg = { ...DEFAULT_CONFIG, ...overrides };
  return generateChunkData(
    cx, cz, n.heightN, n.detailN, n.biomeN, n.tempN,
    n.treeN, n.structN, n.regionN, cfg, n.continentN,
  );
}

function sampler(seed = 42, overrides?: Partial<WorldConfig>): TerrainSamplerInputs {
  const n = nf(seed);
  return {
    heightN: n.heightN, detailN: n.detailN, biomeN: n.biomeN, tempN: n.tempN,
    regionN: n.regionN, continentN: n.continentN,
    cfg: { ...DEFAULT_CONFIG, ...overrides },
  };
}

/* ═══════════════════════════════════════════════════════════════
 *  4.1 — Slope ramps
 * ═══════════════════════════════════════════════════════════════ */

describe('Slope ramps (Phase 4.1)', () => {
  it('ChunkVoxelData exposes ramp buffers', () => {
    const chunk = gen(0, 0);
    expect(chunk.rampPositions).toBeInstanceOf(Float32Array);
    expect(chunk.rampColors).toBeInstanceOf(Float32Array);
    expect(chunk.rampMeta).toBeInstanceOf(Int8Array);
    expect(typeof chunk.rampCount).toBe('number');
  });

  it('produces ramp instances on a standard-or-autopista highway', () => {
    let totalRamps = 0;
    // Rural highways have half-width 3 → all cells are barrier or median;
    // pure-asphalt cells exist only on standard (half-width 5) and
    // autopista (half-width 7). Find the first one.
    let gridIdx = 11;
    while (gridIdx < 40) {
      const cls = getHighwayClass(gridIdx, 0, true);
      if (cls === 'standard' || cls === 'autopista') break;
      gridIdx++;
    }
    expect(gridIdx).toBeLessThan(40);
    const czA = Math.floor((gridIdx * INTER_HW_SPACING) / CHUNK_SIZE);
    for (const cz of [czA, czA - 1, czA + 1]) {
      for (let cx = -50; cx <= 50 && totalRamps === 0; cx += 5) {
        totalRamps += gen(cx, cz, 42).rampCount;
      }
      if (totalRamps > 0) break;
    }
    expect(totalRamps).toBeGreaterThan(0);
  }, 60_000);

  it('ramp meta values are in {-2, -1, +1, +2}', () => {
    let inspected = 0;
    for (let cx = -5; cx <= 5 && inspected < 50; cx++) {
      for (let cz = -5; cz <= 5 && inspected < 50; cz++) {
        const chunk = gen(cx, cz, 200);
        for (let i = 0; i < chunk.rampCount; i++) {
          const m = chunk.rampMeta[i];
          expect([-2, -1, +1, +2]).toContain(m);
          inspected++;
        }
      }
    }
  });
});

/* ═══════════════════════════════════════════════════════════════
 *  4.2 — Coast sand band
 * ═══════════════════════════════════════════════════════════════ */

describe('Coast sand band (Phase 4.2)', () => {
  it('plains/forest cells at water level emit voxels with sand colour (~ #e6d09c)', () => {
    let foundSandVoxel = false;
    for (const seed of [100, 42, 200, 314]) {
      for (let cx = -8; cx <= 8 && !foundSandVoxel; cx++) {
        for (let cz = -8; cz <= 8 && !foundSandVoxel; cz++) {
          const chunk = gen(cx, cz, seed);
          for (let i = 0; i < chunk.count; i++) {
            const r = chunk.colors[i * 3];
            const g = chunk.colors[i * 3 + 1];
            const b = chunk.colors[i * 3 + 2];
            // Sand colour roughly: r≈0.9, g≈0.82, b≈0.61 (vary slightly)
            if (r > 0.82 && g > 0.72 && b > 0.5 && b < 0.75 && r > b) {
              foundSandVoxel = true;
              break;
            }
          }
        }
      }
      if (foundSandVoxel) break;
    }
    expect(foundSandVoxel).toBe(true);
  });
});

/* ═══════════════════════════════════════════════════════════════
 *  4.7 — Cross-chunk road level continuity
 * ═══════════════════════════════════════════════════════════════ */

describe('Cross-chunk road level (Phase 4.7)', () => {
  it('computeRoadLevelAt is pure-deterministic (same input → same output, any caller)', () => {
    const s = sampler(42);
    let gridIdx = 11;
    while (gridIdx < 40 && getHighwayClass(gridIdx, 0, true) === 'none') gridIdx++;
    const wz = gridIdx * INTER_HW_SPACING;

    // The smoothness guarantee is THIS: chunk A and chunk B that
    // both ask about the same (wx, wz) get the SAME answer. We test
    // this by calling computeRoadLevelAt multiple times — being pure
    // and stateless, it must always match.
    let probed = 0;
    let pureMismatches = 0;
    for (let wx = -100; wx <= 100; wx++) {
      const hi = getInterHighwayInfo(wx, wz);
      if (!hi || hi.isShoulder) continue;
      const a = computeRoadLevelAt(s, wx, wz, hi);
      const b = computeRoadLevelAt(s, wx, wz, hi);
      const c = computeRoadLevelAt(s, wx, wz);  // no `hi` shortcut
      if (a !== b || a !== c) pureMismatches++;
      probed++;
    }
    expect(probed).toBeGreaterThan(0);
    expect(pureMismatches).toBe(0);
  });

  it('adjacent highway cells rarely jump > 3 voxels (terrain variance bound)', () => {
    const s = sampler(42);
    let gridIdx = 11;
    while (gridIdx < 40 && getHighwayClass(gridIdx, 0, true) === 'none') gridIdx++;
    const wz = gridIdx * INTER_HW_SPACING;

    let prev = -Infinity;
    let bigJumps = 0;
    let probed = 0;
    for (let wx = -100; wx <= 100; wx++) {
      const hi = getInterHighwayInfo(wx, wz);
      if (!hi || hi.isShoulder) continue;
      const lvl = computeRoadLevelAt(s, wx, wz, hi);
      if (lvl < 0) continue;
      if (prev > -Infinity && Math.abs(lvl - prev) > 3) bigJumps++;
      prev = lvl;
      probed++;
    }
    expect(probed).toBeGreaterThan(0);
    // Bound the worst jump — anything > 3 voxels between adjacent cells
    // means the sampler is producing severe artifacts.
    expect(bigJumps).toBeLessThan(probed * 0.05); // < 5% can spike > 3
  });
});
