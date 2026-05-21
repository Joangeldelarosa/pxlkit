/* ═══════════════════════════════════════════════════════════════
 *  Wedge geometry — triangular prism for slope ramps
 *
 *  Phase 4.1.
 *
 *  Provides 4 baked geometries, one per descent direction. Each is
 *  a unit cube (VOXEL_SIZE on each side) with its top voxel face
 *  REPLACED by a tilted triangle:
 *
 *    +X descent (meta=+1): top descends from -X edge to +X edge
 *    -X descent (meta=-1): top descends from +X edge to -X edge
 *    +Z descent (meta=+2): top descends from -Z edge to +Z edge
 *    -Z descent (meta=-2): top descends from +Z edge to -Z edge
 *
 *  Each geometry is built once and shared across all chunks.
 *  Centered on the cell footprint (same anchor as a regular voxel).
 *
 *  Faces (5 total):
 *   - bottom (square at Y = -V/2)
 *   - 2 vertical side rectangles (perpendicular to descent)
 *   - 1 vertical rectangle on the high-edge side
 *   - 1 tilted top triangle (the slope surface)
 *
 *  No "low-edge" vertical face because that edge of the wedge is
 *  flush with the lower neighbour's top voxel — visible only if the
 *  neighbour isn't there (rare; acceptable visual cost).
 * ═══════════════════════════════════════════════════════════════ */

import * as THREE from 'three';
import { VOXEL_SIZE } from '../constants';

/**
 * Build a wedge BufferGeometry for descent in +X.
 *
 * Vertex layout (local coords, V = VOXEL_SIZE/2):
 *   p0 = (-V, -V, -V)   bottom-back-left  (high-side bottom corner)
 *   p1 = (+V, -V, -V)   bottom-back-right (low-side bottom corner)
 *   p2 = (+V, -V, +V)   bottom-front-right
 *   p3 = (-V, -V, +V)   bottom-front-left
 *   p4 = (-V, +V, -V)   top-back-left     (high-side top corner)
 *   p5 = (-V, +V, +V)   top-front-left
 *
 *   The low-side top is fused with the low-side bottom (p1, p2) —
 *   that's what makes it a wedge.
 */
function buildWedgeXPos(): THREE.BufferGeometry {
  const V = VOXEL_SIZE / 2;
  const g = new THREE.BufferGeometry();
  const positions = new Float32Array([
    -V, -V, -V,  // 0
    +V, -V, -V,  // 1
    +V, -V, +V,  // 2
    -V, -V, +V,  // 3
    -V, +V, -V,  // 4
    -V, +V, +V,  // 5
  ]);
  const indices = [
    // Bottom (looking down, normal -Y) — CCW from below
    0, 1, 2,
    0, 2, 3,
    // High-side wall (X = -V, normal -X) — CCW from -X
    0, 3, 5,
    0, 5, 4,
    // Back side triangle (Z = -V, normal -Z)
    0, 4, 1,
    // Front side triangle (Z = +V, normal +Z)
    3, 2, 5,
    // Low-side bottom edge has no wall (p1-p2 are bottom corners; the
    //  geometry already collapses at that line)
    // Tilted top (the slope) — from p4-p5 down to p1-p2
    // Quad (p4, p5, p2, p1) — split into 2 tris
    4, 5, 2,
    4, 2, 1,
  ];
  g.setIndex(indices);
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.computeVertexNormals();
  return g;
}

/** Build wedge in any of the 4 directions by rotating the +X base. */
function buildWedgeRotated(rotateY: number): THREE.BufferGeometry {
  const base = buildWedgeXPos();
  base.rotateY(rotateY);
  return base;
}

/** Public geometries — built lazily so SSR doesn't pre-allocate THREE objects */

let _geos: { [key: number]: THREE.BufferGeometry } | null = null;

export function getWedgeGeometry(meta: number): THREE.BufferGeometry {
  if (!_geos) {
    _geos = {
      [+1]: buildWedgeXPos(),                    // +X
      [-1]: buildWedgeRotated(Math.PI),          // -X (180° around Y)
      [+2]: buildWedgeRotated(-Math.PI / 2),     // +Z (the +X face rotates to +Z)
      [-2]: buildWedgeRotated(+Math.PI / 2),     // -Z
    };
  }
  return _geos[meta];
}

export const WEDGE_META_VALUES: readonly number[] = [+1, -1, +2, -2];
