/* ═══════════════════════════════════════════════════════════════
 *  Slope Ramps — anti-stair-stepping for roads
 *
 *  Phase 4.1.
 *
 *  Detects pairs of adjacent road cells (both on the same chunk OR
 *  the in-chunk cell and an adjacent +1-border cell whose road state
 *  has been recorded by chunk.ts) that differ by exactly 1 voxel in
 *  road height. For each such pair, the HIGHER cell becomes a wedge:
 *  a triangular prism that replaces its top voxel cube. The wedge's
 *  hypotenuse face is the tilted road surface; the side triangles
 *  fill what would otherwise be a stair-step gap.
 *
 *  Restricted to roads ON PURPOSE — terrain, mountain rock, buildings
 *  stay blocky (preserves the pixel-art aesthetic). The eligibility
 *  is decided by the caller via `roadHeightMap`: a cell where
 *  `roadHeightMap[idx] >= 0` is road; the value is its road surface
 *  Y in voxel units.
 *
 *  Cross-chunk handling: callers pass a `+1 border` version of the
 *  road height map (gW × gW grid). For each in-chunk cell (lx, lz),
 *  neighbour heights at chunk borders read from the border slots
 *  (indices outside [0, CHUNK_SIZE)).
 *
 *  Wedge ownership: the HIGHER cell owns the wedge. Each ramp is
 *  emitted exactly once — by the chunk containing the higher cell.
 *  Lower-side cells from other chunks emit their own wedges when
 *  they are themselves the higher side of another descent.
 * ═══════════════════════════════════════════════════════════════ */

import { CHUNK_SIZE, VOXEL_SIZE } from '../constants';

export interface RampEmitContext {
  /** Output buffers (sized by caller). */
  rampPositions: Float32Array;   // [x, y, z] per ramp
  rampColors: Float32Array;      // [r, g, b] per ramp
  rampMeta: Int8Array;           // ±1 (X descent) or ±2 (Z descent)
  /** Mutated — caller passes 0; we return updated count. */
  count: number;
  /** Inputs */
  bX: number;
  bZ: number;
  /** Road surface Y per cell (+1 border). -1 if not a road cell.
   *  Indexed as `roadHeightMap[(lx+1)*gW + (lz+1)]` like hMap. */
  roadHeightMap: Int32Array;
  /** Road surface RGB per cell (in-chunk only, CHUNK_SIZE²×3).
   *  Used for the wedge's tilted top colour. */
  roadColorMap: Float32Array;
  /** Side length of the gW border-extended grid */
  gW: number;
}

export function emitRampsForChunk(ctx: RampEmitContext): number {
  const { rampPositions, rampColors, rampMeta, roadHeightMap, roadColorMap, gW, bX, bZ } = ctx;
  let count = ctx.count;

  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const idx = (lx + 1) * gW + (lz + 1);
      const myH = roadHeightMap[idx];
      if (myH < 0) continue; // not a road cell

      // ── Check 4 neighbours for a 1-voxel lower road ──
      // Order: +X, -X, +Z, -Z
      const nXp = roadHeightMap[(lx + 2) * gW + (lz + 1)];   // +X neighbour
      const nXn = roadHeightMap[(lx + 0) * gW + (lz + 1)];   // -X neighbour
      const nZp = roadHeightMap[(lx + 1) * gW + (lz + 2)];   // +Z neighbour
      const nZn = roadHeightMap[(lx + 1) * gW + (lz + 0)];   // -Z neighbour

      const dXp = (nXp >= 0 && myH - nXp === 1) ? 1 : 0;
      const dXn = (nXn >= 0 && myH - nXn === 1) ? 1 : 0;
      const dZp = (nZp >= 0 && myH - nZp === 1) ? 1 : 0;
      const dZn = (nZn >= 0 && myH - nZn === 1) ? 1 : 0;

      // At least one direction must descend by exactly 1 voxel.
      // For multi-descent cells (corners) we pick a single direction
      // — the one with the lowest neighbour height (steepest visible
      // step). Visually a single-direction wedge in a corner still
      // smooths the dominant slope and matches the lower neighbour
      // perfectly; the orthogonal step remains as a clean cube edge.
      if (dXp + dXn + dZp + dZn === 0) continue;

      let meta = 0;
      let bestH = Infinity;
      if (dXp && nXp < bestH) { meta = +1; bestH = nXp; }
      if (dXn && nXn < bestH) { meta = -1; bestH = nXn; }
      if (dZp && nZp < bestH) { meta = +2; bestH = nZp; }
      if (dZn && nZn < bestH) { meta = -2; bestH = nZn; }

      // ── Read this cell's road colour ──
      const colorIdx = (lx * CHUNK_SIZE + lz) * 3;
      const r = roadColorMap[colorIdx];
      const g = roadColorMap[colorIdx + 1];
      const b = roadColorMap[colorIdx + 2];
      if (r === 0 && g === 0 && b === 0) continue; // no colour recorded — skip

      // Wedge anchor: cell footprint centre, Y at the TOP voxel centre
      // (same Y the original top cube would be at — the wedge geometry
      // is centred on its own bounding cube).
      const wx = (bX + lx) * VOXEL_SIZE;
      const wy = myH * VOXEL_SIZE;
      const wz = (bZ + lz) * VOXEL_SIZE;

      rampPositions[count * 3]     = wx;
      rampPositions[count * 3 + 1] = wy;
      rampPositions[count * 3 + 2] = wz;
      rampColors[count * 3]     = r;
      rampColors[count * 3 + 1] = g;
      rampColors[count * 3 + 2] = b;
      rampMeta[count] = meta;
      count++;
    }
  }

  return count;
}
