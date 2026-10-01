import { describe, expect, it } from 'vitest';
import { PIXEL_GLYPHS, PIXEL_GLYPH_STYLE, PIXEL_GLYPH_VIEWBOX } from '../index';

describe('pixel glyphs', () => {
  it('draws every glyph on the 8×8 grid', () => {
    expect(PIXEL_GLYPH_VIEWBOX).toBe('0 0 8 8');
    for (const glyph of Object.values(PIXEL_GLYPHS)) {
      expect(glyph.rects.length).toBeGreaterThan(0);
      for (const [x, y, width, height] of glyph.rects) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(x + width).toBeLessThanOrEqual(8);
        expect(y + height).toBeLessThanOrEqual(8);
      }
    }
  });

  it('keeps each pixel unique within a glyph', () => {
    for (const glyph of Object.values(PIXEL_GLYPHS)) {
      const keys = glyph.rects.map(([x, y]) => `${x}-${y}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('sizes the chevron smaller than the check and close glyphs', () => {
    expect(PIXEL_GLYPHS.chevronDown.className).toBe('h-2.5 w-2.5 shrink-0');
    expect(PIXEL_GLYPHS.check.className).toBe('h-3 w-3 shrink-0');
    expect(PIXEL_GLYPHS.close.className).toBe('h-3 w-3 shrink-0');
  });

  it('renders inline without clipping or shrinking', () => {
    expect(PIXEL_GLYPH_STYLE).toEqual({
      display: 'inline-block',
      verticalAlign: 'middle',
      overflow: 'visible',
      flexShrink: 0,
    });
  });
});
