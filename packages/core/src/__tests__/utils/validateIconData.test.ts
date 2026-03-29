import { describe, it, expect } from 'vitest';
import { validateIconData, isValidIconData } from '../../utils/validateIconData';
import type { PxlKitData } from '../../types';
import { testIcon } from '../fixtures';

function makeIcon(overrides: Partial<PxlKitData> = {}): PxlKitData {
  return { ...testIcon, ...overrides };
}

describe('validateIconData', () => {
  it('returns empty array for a valid icon', () => {
    expect(validateIconData(testIcon)).toHaveLength(0);
  });

  describe('name validation', () => {
    it('reports error for PascalCase name', () => {
      const errors = validateIconData(makeIcon({ name: 'Trophy' }));
      expect(errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('reports error for name with spaces', () => {
      const errors = validateIconData(makeIcon({ name: 'my Trophy' }));
      expect(errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('reports error for name starting with a number', () => {
      const errors = validateIconData(makeIcon({ name: '123icon' }));
      expect(errors.some((e) => e.field === 'name')).toBe(true);
    });

    it('accepts valid kebab-case names', () => {
      const errors1 = validateIconData(makeIcon({ name: 'fire-sword' }));
      const errors2 = validateIconData(makeIcon({ name: 'icon1' }));
      expect(errors1.some((e) => e.field === 'name')).toBe(false);
      expect(errors2.some((e) => e.field === 'name')).toBe(false);
    });
  });

  describe('size validation', () => {
    it('accepts valid sizes: 8, 16, 24, 32, 48, 64', () => {
      ([8, 16, 24, 32, 48, 64] as number[]).forEach((size) => {
        const icon = {
          ...testIcon,
          size: size as PxlKitData['size'],
          grid: Array(size).fill('.'.repeat(size)),
        };
        const errors = validateIconData(icon);
        expect(errors.some((e) => e.field === 'size')).toBe(false);
      });
    });

    it('reports error for invalid size 10', () => {
      const errors = validateIconData({
        ...testIcon,
        size: 10 as PxlKitData['size'],
      });
      expect(errors.some((e) => e.field === 'size')).toBe(true);
    });

    it('reports error for invalid size 100', () => {
      const errors = validateIconData({
        ...testIcon,
        size: 100 as PxlKitData['size'],
      });
      expect(errors.some((e) => e.field === 'size')).toBe(true);
    });
  });

  describe('grid validation', () => {
    it('reports error for wrong number of rows', () => {
      const errors = validateIconData(
        makeIcon({ grid: ['........', '........'] })
      );
      expect(errors.some((e) => e.field === 'grid')).toBe(true);
    });

    it('reports error for row with wrong length', () => {
      const grid = [...testIcon.grid];
      grid[0] = '....'; // too short
      const errors = validateIconData(makeIcon({ grid }));
      expect(errors.some((e) => e.field === 'grid[0]')).toBe(true);
    });

    it('reports error for character in grid not in palette', () => {
      const grid = [...testIcon.grid];
      grid[0] = 'Z.......'; // Z not in palette
      const errors = validateIconData(makeIcon({ grid }));
      expect(errors.some((e) => e.field === 'palette')).toBe(true);
    });
  });

  describe('palette validation', () => {
    it('reports error for palette key "."', () => {
      const errors = validateIconData(
        makeIcon({ palette: { ...testIcon.palette, '.': '#FF0000' } })
      );
      expect(errors.some((e) => e.field === 'palette')).toBe(true);
    });

    it('reports error for palette key with more than 1 character', () => {
      const errors = validateIconData(
        makeIcon({ palette: { ...testIcon.palette, AB: '#FF0000' } })
      );
      expect(errors.some((e) => e.field.startsWith('palette.'))).toBe(true);
    });

    it('reports error for invalid hex color', () => {
      const errors = validateIconData(
        makeIcon({ palette: { ...testIcon.palette, X: 'notacolor' } })
      );
      expect(errors.some((e) => e.field.startsWith('palette.'))).toBe(true);
    });

    it('reports warning for #RRGGBB00 palette entry (0 opacity)', () => {
      const errors = validateIconData(
        makeIcon({ palette: { ...testIcon.palette, X: '#FF000000' } })
      );
      expect(errors.some((e) => e.field.startsWith('palette.'))).toBe(true);
    });

    it('accepts #RGB, #RRGGBB, #RRGGBBAA palette values', () => {
      const icon = makeIcon({
        palette: {
          R: '#F00',
          G: '#00FF00',
          B: '#0000FF80',
        },
        grid: [
          'R.......',
          'G.......',
          'B.......',
          '........',
          '........',
          '........',
          '........',
          '........',
        ],
      });
      const errors = validateIconData(icon);
      const paletteErrors = errors.filter((e) =>
        e.field.startsWith('palette')
      );
      expect(paletteErrors).toHaveLength(0);
    });
  });

  describe('category validation', () => {
    it('reports error for empty category', () => {
      const errors = validateIconData(makeIcon({ category: '' }));
      expect(errors.some((e) => e.field === 'category')).toBe(true);
    });

    it('reports error for whitespace-only category', () => {
      const errors = validateIconData(makeIcon({ category: '   ' }));
      expect(errors.some((e) => e.field === 'category')).toBe(true);
    });
  });

  it('returns multiple errors at once', () => {
    const errors = validateIconData({
      name: 'BAD NAME',
      size: 99 as PxlKitData['size'],
      category: '',
      grid: [],
      palette: {},
      tags: [],
    });
    expect(errors.length).toBeGreaterThan(2);
  });
});

describe('isValidIconData', () => {
  it('returns true for valid icon', () => {
    expect(isValidIconData(testIcon)).toBe(true);
  });

  it('returns false for invalid icon', () => {
    expect(
      isValidIconData({ ...testIcon, name: 'Invalid Name' })
    ).toBe(false);
  });
});
