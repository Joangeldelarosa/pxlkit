import { describe, it, expect } from 'vitest';
import {
  parseHexColor,
  gridToPixels,
  encodeHexColor,
  pixelsToGrid,
} from '../../utils/gridToPixels';
import { testIcon, testIconWithAlpha } from '../fixtures';

describe('parseHexColor', () => {
  it('expands #RGB format to #RRGGBB with opacity 1', () => {
    const result = parseHexColor('#F00');
    expect(result.color).toBe('#FF0000');
    expect(result.opacity).toBe(1);
  });

  it('handles #RGB without # prefix', () => {
    const result = parseHexColor('F00');
    expect(result.color).toBe('#FF0000');
    expect(result.opacity).toBe(1);
  });

  it('returns #RRGGBB as-is (uppercase) with opacity 1', () => {
    const result = parseHexColor('#ff0000');
    expect(result.color).toBe('#FF0000');
    expect(result.opacity).toBe(1);
  });

  it('returns #RRGGBB with opacity 1 when already uppercase', () => {
    const result = parseHexColor('#00FF00');
    expect(result.color).toBe('#00FF00');
    expect(result.opacity).toBe(1);
  });

  it('handles #RRGGBBAA format extracting RGB and opacity', () => {
    const result = parseHexColor('#FF000080');
    expect(result.color).toBe('#FF0000');
    // 0x80 / 255 = 0.502 (rounded to 3 decimal places)
    expect(result.opacity).toBeCloseTo(0.502, 2);
  });

  it('handles #RRGGBB00 → opacity 0', () => {
    const result = parseHexColor('#FF000000');
    expect(result.color).toBe('#FF0000');
    expect(result.opacity).toBe(0);
  });

  it('handles #RRGGBBFF → opacity 1', () => {
    const result = parseHexColor('#FF0000FF');
    expect(result.color).toBe('#FF0000');
    expect(result.opacity).toBe(1);
  });

  it('works without # prefix for 8-digit format', () => {
    const result = parseHexColor('FF000080');
    expect(result.color).toBe('#FF0000');
    expect(result.opacity).toBeCloseTo(0.502, 2);
  });

  it('falls back for invalid/unusual length', () => {
    const result = parseHexColor('#FFFFF');
    expect(result.opacity).toBe(1);
    expect(typeof result.color).toBe('string');
  });
});

describe('gridToPixels', () => {
  it('returns correct pixels for a simple icon with 2 colors', () => {
    const pixels = gridToPixels(testIcon);
    // The testIcon has R at (1,1),(2,1),(1,2),(2,2) and others...
    const redPixels = pixels.filter((p) => p.color === '#FF0000');
    expect(redPixels.length).toBe(4);
    expect(pixels.every((p) => p.x >= 0 && p.y >= 0)).toBe(true);
  });

  it('returns empty array for all-transparent grid', () => {
    const emptyIcon = {
      name: 'empty',
      size: 8 as const,
      category: 'test',
      grid: Array(8).fill('........'),
      palette: {},
      tags: [],
    };
    expect(gridToPixels(emptyIcon)).toHaveLength(0);
  });

  it('includes opacity for #RRGGBBAA palette entries', () => {
    const pixels = gridToPixels(testIconWithAlpha);
    const alphaPixels = pixels.filter((p) => p.opacity !== undefined);
    expect(alphaPixels.length).toBeGreaterThan(0);
    expect(alphaPixels[0].opacity).toBeCloseTo(0.502, 2);
  });

  it('excludes pixels with opacity 0', () => {
    const iconWithZeroOpacity = {
      name: 'zero-opacity',
      size: 8 as const,
      category: 'test',
      grid: [
        'AA......',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ],
      palette: { A: '#FF000000' },
      tags: [],
    };
    expect(gridToPixels(iconWithZeroOpacity)).toHaveLength(0);
  });

  it('returns exactly 1 pixel for single-pixel icon', () => {
    const singlePixel = {
      name: 'single',
      size: 8 as const,
      category: 'test',
      grid: [
        'A.......',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
        '........',
      ],
      palette: { A: '#FF0000' },
      tags: [],
    };
    const pixels = gridToPixels(singlePixel);
    expect(pixels).toHaveLength(1);
    expect(pixels[0]).toEqual({ x: 0, y: 0, color: '#FF0000' });
  });

  it('pixels with opacity 1 do NOT have opacity field', () => {
    const pixels = gridToPixels(testIcon);
    // All palette entries in testIcon have no alpha → opacity should be absent
    pixels.forEach((p) => {
      expect(p.opacity).toBeUndefined();
    });
  });

  it('returns correct x, y coordinates', () => {
    const pixels = gridToPixels(testIcon);
    const greenPixels = pixels.filter((p) => p.color === '#00FF00');
    // G at positions (5,1),(6,1),(5,2),(6,2)
    expect(greenPixels.some((p) => p.x === 5 && p.y === 1)).toBe(true);
    expect(greenPixels.some((p) => p.x === 6 && p.y === 2)).toBe(true);
  });
});

describe('encodeHexColor', () => {
  it('returns #RRGGBB when opacity is 1', () => {
    expect(encodeHexColor('#FF0000', 1)).toBe('#FF0000');
  });

  it('returns #RRGGBBAA when opacity < 1', () => {
    const result = encodeHexColor('#FF0000', 0.5);
    // 0.5 * 255 = 127.5 → rounds to 128 = 0x80
    expect(result).toBe('#FF000080');
  });

  it('returns #RRGGBB when opacity is undefined', () => {
    expect(encodeHexColor('#FF0000')).toBe('#FF0000');
  });

  it('adds # prefix if missing', () => {
    expect(encodeHexColor('FF0000', 1)).toBe('#FF0000');
  });

  it('encodes opacity 0 as #RRGGBB00', () => {
    const result = encodeHexColor('#FF0000', 0);
    expect(result).toBe('#FF000000');
  });

  it('returns uppercase hex', () => {
    expect(encodeHexColor('#ff0000', 1)).toBe('#FF0000');
  });
});

describe('pixelsToGrid', () => {
  it('generates correct grid and palette for a simple pixel array', () => {
    const pixels = [
      { x: 0, y: 0, color: '#FF0000' },
      { x: 1, y: 0, color: '#00FF00' },
    ];
    const { grid, palette } = pixelsToGrid(pixels, 4);
    expect(Object.keys(palette)).toHaveLength(2);
    expect(grid).toHaveLength(4);
    // First row should have two palette chars followed by dots
    expect(grid[0]).toHaveLength(4);
    expect(grid[0][2]).toBe('.');
    expect(grid[0][3]).toBe('.');
  });

  it('returns all-dots grid and empty palette for empty pixel array', () => {
    const { grid, palette } = pixelsToGrid([], 8);
    expect(Object.keys(palette)).toHaveLength(0);
    grid.forEach((row) => expect(row).toBe('........'));
  });

  it('assigns palette keys starting from A', () => {
    const pixels = [
      { x: 0, y: 0, color: '#FF0000' },
      { x: 1, y: 0, color: '#00FF00' },
      { x: 2, y: 0, color: '#0000FF' },
    ];
    const { palette } = pixelsToGrid(pixels, 4);
    expect(Object.keys(palette)).toContain('A');
    expect(Object.keys(palette)).toContain('B');
    expect(Object.keys(palette)).toContain('C');
  });

  it('gives different palette entries for pixels with different opacity', () => {
    const pixels = [
      { x: 0, y: 0, color: '#FF0000' },
      { x: 1, y: 0, color: '#FF0000', opacity: 0.5 },
    ];
    const { palette } = pixelsToGrid(pixels, 4);
    // Should be 2 different palette entries (same color, different opacity)
    expect(Object.keys(palette)).toHaveLength(2);
  });

  it('round-trips with gridToPixels', () => {
    const original = gridToPixels(testIcon);
    const { grid, palette } = pixelsToGrid(original, testIcon.size);
    const reconstructed = gridToPixels({
      name: 'reconstructed',
      size: testIcon.size,
      category: 'test',
      grid,
      palette,
      tags: [],
    });
    expect(reconstructed).toHaveLength(original.length);
    // Sort both arrays to compare
    const sortPixels = (p: typeof original) =>
      [...p].sort((a, b) => a.y * 1000 + a.x - (b.y * 1000 + b.x));
    const origSorted = sortPixels(original);
    const reconSorted = sortPixels(reconstructed);
    origSorted.forEach((p, i) => {
      expect(reconSorted[i].color).toBe(p.color);
      expect(reconSorted[i].x).toBe(p.x);
      expect(reconSorted[i].y).toBe(p.y);
    });
  });
});
