import { describe, it, expect } from 'vitest';
import { computeGridGeometry } from './grid-geometry';

describe('computeGridGeometry', () => {
  it('returns gridSize+1 line offsets spanning 0..renderPx', () => {
    const g = computeGridGeometry(16, 64);
    expect(g.cellPx).toBe(4);
    expect(g.lines).toHaveLength(17);
    expect(g.lines[0]).toBe(0);
    expect(g.lines[16]).toBe(64);
    expect(g.lines[1]).toBe(4);
  });

  it('supports non-integer cell sizes (24 on a 16-grid)', () => {
    const g = computeGridGeometry(16, 24);
    expect(g.cellPx).toBeCloseTo(1.5);
    expect(g.lines[1]).toBeCloseTo(1.5);
    expect(g.lines[16]).toBe(24);
  });

  it('handles an 8x8 grid', () => {
    const g = computeGridGeometry(8, 64);
    expect(g.cellPx).toBe(8);
    expect(g.lines).toHaveLength(9);
    expect(g.lines.at(-1)).toBe(64);
  });

  it('returns empty geometry for an invalid grid size', () => {
    const g = computeGridGeometry(0, 64);
    expect(g.lines).toEqual([]);
    expect(g.cellPx).toBe(0);
  });
});
