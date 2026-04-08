// ─────────────────────────────────────────────
// @pxlkit/voxel — Type Definitions
// ─────────────────────────────────────────────

import type { PxlKitData } from '@pxlkit/core';

/**
 * Represents a single voxel position with its color.
 */
export interface Voxel {
  /** X position in grid (column) */
  x: number;
  /** Y position in grid (row, flipped for 3D — 0 is bottom) */
  y: number;
  /** Z position (depth — 0 for flat icons) */
  z: number;
  /** Hex color string */
  color: string;
}

/**
 * Voxel model data — a 3D extension of PxlKitData.
 * Can represent flat pixel art extruded into 3D, or full 3D voxel sculptures.
 */
export interface VoxelData {
  /** Unique name in kebab-case */
  name: string;
  /** Grid width */
  width: number;
  /** Grid height */
  height: number;
  /** Depth layers (1 for flat pixel art) */
  depth: number;
  /** Voxel positions and colors */
  voxels: Voxel[];
  /** Searchable tags */
  tags: string[];
  /** Optional author */
  author?: string;
}

/**
 * Configuration for converting PxlKitData to voxels.
 */
export interface VoxelConvertOptions {
  /** Scale factor — each pixel becomes NxN voxels (default: 1) */
  scale?: number;
  /** Depth of the extrusion in voxel units (default: 1) */
  extrudeDepth?: number;
}

/**
 * Convert a PxlKitData icon into an array of Voxel positions.
 * Each non-transparent pixel becomes one or more 3D voxels.
 */
export function pxlToVoxels(
  icon: PxlKitData,
  options: VoxelConvertOptions = {},
): Voxel[] {
  const { scale = 1, extrudeDepth = 1 } = options;
  const voxels: Voxel[] = [];
  const { grid, palette, size } = icon;

  for (let row = 0; row < size; row++) {
    const rowStr = grid[row];
    if (!rowStr) continue; // skip missing rows (defensive)
    for (let col = 0; col < size; col++) {
      const char = rowStr[col];
      if (!char || char === '.') continue;
      const color = palette[char];
      if (!color) continue;

      // Scale up: each pixel becomes scale×scale×extrudeDepth block
      for (let sx = 0; sx < scale; sx++) {
        for (let sy = 0; sy < scale; sy++) {
          for (let sz = 0; sz < extrudeDepth; sz++) {
            voxels.push({
              x: col * scale + sx,
              y: (size - 1 - row) * scale + sy, // flip Y for 3D (bottom-up)
              z: sz,
              color,
            });
          }
        }
      }
    }
  }

  return voxels;
}

/**
 * Upscale a PxlKitData grid by a factor of N.
 * Each pixel becomes an NxN block, producing a (size*N) grid.
 */
export function upscaleGrid(grid: string[], factor: number): string[] {
  const result: string[] = [];
  for (const row of grid) {
    const expandedRow = row.split('').map((c) => c.repeat(factor)).join('');
    for (let i = 0; i < factor; i++) {
      result.push(expandedRow);
    }
  }
  return result;
}
