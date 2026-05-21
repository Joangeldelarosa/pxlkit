/* ═══════════════════════════════════════════════════════════════
 *  Bridge spans — endpoint-anchored pillar placement
 *
 *  Phase 4.6.
 *
 *  Detects contiguous runs of "over water" highway cells inside a
 *  chunk and records them as BridgeSpan instances. Pillar placement
 *  later in the chunk emit loop reads these spans so pillars are
 *  anchored to the span endpoints + structural midpoints — not to a
 *  global world-coord modulo (the old behaviour, which produced
 *  pillars in arbitrary places).
 *
 *  Cross-chunk bridges: each chunk detects only the run within its
 *  own bounds. A bridge that crosses 2 chunks records 2 spans (one
 *  per chunk), each with its own endpoints. Pillars at the chunk
 *  border are still anchored — they sit at the per-chunk endpoint
 *  which IS the chunk boundary. This works because both adjacent
 *  chunks compute their boundary cell consistently.
 * ═══════════════════════════════════════════════════════════════ */

import { CHUNK_SIZE } from '../constants';
import type { InterHighwayInfo } from '../city/layout';

export interface BridgeSpan {
  axis: 'x' | 'z';
  /** Voxel-coord endpoints (world units). */
  startWX: number;
  startWZ: number;
  endWX: number;
  endWZ: number;
  /** Length in cells (along the axis). */
  length: number;
}

export interface BridgeDetectInputs {
  bX: number;
  bZ: number;
  hMap: Int32Array;            // +1 border terrain heights
  waterLevelMap: Int32Array;   // per-cell water level (CHUNK_SIZE²)
  hwInfoMap: (InterHighwayInfo | null)[]; // per-cell highway info (CHUNK_SIZE²)
}

/** Scan the chunk and return every contiguous over-water highway run. */
export function detectBridgeSpans(inputs: BridgeDetectInputs): BridgeSpan[] {
  const { bX, bZ, hMap, waterLevelMap, hwInfoMap } = inputs;
  const gW = CHUNK_SIZE + 2;
  const spans: BridgeSpan[] = [];

  function isOverWaterCell(lx: number, lz: number): boolean {
    if (lx < 0 || lx >= CHUNK_SIZE || lz < 0 || lz >= CHUNK_SIZE) return false;
    const hi = hwInfoMap[lx * CHUNK_SIZE + lz];
    if (!hi) return false;
    const h = hMap[(lx + 1) * gW + (lz + 1)];
    const wl = waterLevelMap[lx * CHUNK_SIZE + lz];
    return h < wl;
  }

  /* ── X-axis runs (rows) ── */
  const visitedX = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
  for (let lz = 0; lz < CHUNK_SIZE; lz++) {
    let runStart = -1;
    for (let lx = 0; lx < CHUNK_SIZE; lx++) {
      const hi = hwInfoMap[lx * CHUNK_SIZE + lz];
      const isHwAxisX = !!hi?.onX;
      const overWater = isHwAxisX && isOverWaterCell(lx, lz);
      if (overWater && runStart === -1) runStart = lx;
      if ((!overWater || lx === CHUNK_SIZE - 1) && runStart !== -1) {
        const runEnd = overWater ? lx : lx - 1;
        if (runEnd - runStart + 1 >= 1) {
          spans.push({
            axis: 'x',
            startWX: bX + runStart,
            startWZ: bZ + lz,
            endWX: bX + runEnd,
            endWZ: bZ + lz,
            length: runEnd - runStart + 1,
          });
          for (let k = runStart; k <= runEnd; k++) visitedX[k * CHUNK_SIZE + lz] = 1;
        }
        runStart = overWater ? lx : -1;
      }
    }
  }

  /* ── Z-axis runs (columns) ── */
  for (let lx = 0; lx < CHUNK_SIZE; lx++) {
    let runStart = -1;
    for (let lz = 0; lz < CHUNK_SIZE; lz++) {
      const hi = hwInfoMap[lx * CHUNK_SIZE + lz];
      const isHwAxisZ = !!hi?.onZ && !hi?.onX; // pure Z-axis bridge
      const overWater = isHwAxisZ && isOverWaterCell(lx, lz);
      if (overWater && runStart === -1) runStart = lz;
      if ((!overWater || lz === CHUNK_SIZE - 1) && runStart !== -1) {
        const runEnd = overWater ? lz : lz - 1;
        if (runEnd - runStart + 1 >= 1) {
          spans.push({
            axis: 'z',
            startWX: bX + lx,
            startWZ: bZ + runStart,
            endWX: bX + lx,
            endWZ: bZ + runEnd,
            length: runEnd - runStart + 1,
          });
        }
        runStart = overWater ? lz : -1;
      }
    }
  }

  return spans;
}

/**
 * Decide whether (wx, wz) is a pillar cell for the given span.
 *  - Endpoints always get a pillar
 *  - Spans > 12: add midpoint pillar
 *  - Spans > 24: add quarter-point pillars
 */
export function shouldPlacePillar(wx: number, wz: number, span: BridgeSpan): boolean {
  const axis = span.axis;
  const pos = axis === 'x' ? wx : wz;
  const start = axis === 'x' ? span.startWX : span.startWZ;
  const end = axis === 'x' ? span.endWX : span.endWZ;
  if (pos === start || pos === end) return true;
  const len = span.length;
  const midpoint = (start + end) / 2;
  if (len > 12 && Math.abs(pos - midpoint) < 0.5) return true;
  if (len > 24) {
    const q1 = start + len * 0.25;
    const q3 = start + len * 0.75;
    if (Math.abs(pos - q1) < 0.5 || Math.abs(pos - q3) < 0.5) return true;
  }
  return false;
}

/**
 * Look up the span (if any) that contains (wx, wz).
 *  O(spans.length) — fine for the typical 0-4 spans per chunk.
 */
export function findSpanAt(spans: BridgeSpan[], wx: number, wz: number, onX: boolean, onZ: boolean): BridgeSpan | null {
  for (const s of spans) {
    if (s.axis === 'x' && onX) {
      if (wz === s.startWZ && wx >= s.startWX && wx <= s.endWX) return s;
    } else if (s.axis === 'z' && onZ && !onX) {
      if (wx === s.startWX && wz >= s.startWZ && wz <= s.endWZ) return s;
    }
  }
  return null;
}
