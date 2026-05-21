/* ═══════════════════════════════════════════════════════════════
 *  Cascades — waterfalls at elevation drops between water bodies
 *
 *  Phase 4.4.
 *
 *  When two adjacent water cells have different water levels (e.g.
 *  a swamp at wl=6 next to plains at wl=5), the natural visual is
 *  a small waterfall flowing from the high body down to the low
 *  body. Without explicit handling we'd see two perfectly flat
 *  water quads at different Ys with a 1-voxel gap between them —
 *  visually broken.
 *
 *  This module emits "cascade voxels" — vertical water cubes that
 *  fill the gap between the two water surfaces, plus spray foam at
 *  the bottom for visual interest.
 *
 *  Output goes into the same water buffers used by the regular
 *  water-surface emission; only the colour varies slightly for the
 *  vertical cascade and a brighter "spray" at the bottom.
 *
 *  Trigger conditions:
 *   - Cell A has h < wlA (water cell)
 *   - At least one cardinal neighbour B has h < wlB AND wlB < wlA - 1
 *     (i.e., the neighbour's water surface is 2+ voxels lower)
 *
 *  Restricting to a ≥ 2 voxel drop avoids spamming cascades for the
 *  normal 1-voxel biome boundary variation; 2+ feels like a real
 *  waterfall.
 * ═══════════════════════════════════════════════════════════════ */

import { CHUNK_SIZE, VOXEL_SIZE } from '../constants';

export interface CascadeEmitInputs {
  bX: number;
  bZ: number;
  hMap: Int32Array;            // +1 border terrain heights
  waterLevelMap: Int32Array;   // CHUNK_SIZE² water level per cell
  /** Per-cell variedConfig waterLevel for the +1 border — only used
   *  to determine cross-chunk cascade triggers. May be null on edges
   *  outside the chunk; we fall back to assuming no drop. */
  borderWaterLevel: Int32Array; // (CHUNK_SIZE + 2)²
  /** Push function for water voxels — same `pushW` chunk.ts uses. */
  pushW: (px: number, py: number, pz: number, hex: string) => void;
}

const MIN_CASCADE_DROP = 2;
const CASCADE_COLOR = '#88ddff';
const CASCADE_SPRAY_COLOR = '#ccf0ff';

export function emitCascades(inputs: CascadeEmitInputs): number {
  const { bX, bZ, hMap, waterLevelMap, borderWaterLevel, pushW } = inputs;
  const gW = CHUNK_SIZE + 2;
  let emitted = 0;

  const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const idx = lx * CHUNK_SIZE + lz;
      const hIdx = (lx + 1) * gW + (lz + 1);
      const h = hMap[hIdx];
      const wl = waterLevelMap[idx];
      if (h >= wl) continue; // not a water cell

      for (const [dx, dz] of dirs) {
        const nx = lx + dx, nz = lz + dz;
        let nWl: number;
        if (nx < 0 || nx >= CHUNK_SIZE || nz < 0 || nz >= CHUNK_SIZE) {
          nWl = borderWaterLevel[(nx + 1) * gW + (nz + 1)];
        } else {
          nWl = waterLevelMap[nx * CHUNK_SIZE + nz];
        }
        if (nWl <= 0) continue;          // missing data — skip
        const drop = wl - nWl;
        if (drop < MIN_CASCADE_DROP) continue;

        // Cell A is the HIGH side. Emit vertical water voxels from
        // (nWl + 1) up to wl, positioned at the boundary between A
        // and B (slightly offset toward B so the cascade "falls" out
        // of A's body into B's body).
        const offsetX = dx * 0.5 * VOXEL_SIZE;
        const offsetZ = dz * 0.5 * VOXEL_SIZE;
        const px = (bX + lx) * VOXEL_SIZE + offsetX;
        const pz = (bZ + lz) * VOXEL_SIZE + offsetZ;
        for (let cy = nWl + 1; cy <= wl; cy++) {
          // top voxel is the upper lip — slightly brighter
          const col = cy === wl ? CASCADE_COLOR : (cy === nWl + 1 ? CASCADE_SPRAY_COLOR : CASCADE_COLOR);
          pushW(px, cy * VOXEL_SIZE - VOXEL_SIZE * 0.25, pz, col);
          emitted++;
        }
        // Only emit one cascade per cell (the largest drop) — break out of dirs
        break;
      }
    }
  }
  return emitted;
}
