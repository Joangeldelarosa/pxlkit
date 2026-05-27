export interface GridGeometry {
  /** Width/height of one grid cell in px (renderPx / gridSize). */
  cellPx: number;
  /** `gridSize + 1` line offsets, from 0 to renderPx inclusive. */
  lines: number[];
}

/**
 * Compute the overlay line positions for an N×N pixel grid scaled to `renderPx`.
 * Offsets are rounded to 4 decimals so non-integer cells (e.g. 24px on a
 * 16-grid → 1.5px) stay clean. Returns empty geometry for an invalid grid.
 */
export function computeGridGeometry(gridSize: number, renderPx: number): GridGeometry {
  if (!Number.isFinite(gridSize) || gridSize < 1) {
    return { cellPx: 0, lines: [] };
  }
  const cellPx = renderPx / gridSize;
  const lines: number[] = [];
  for (let i = 0; i <= gridSize; i++) {
    lines.push(Number((i * cellPx).toFixed(4)));
  }
  return { cellPx, lines };
}
