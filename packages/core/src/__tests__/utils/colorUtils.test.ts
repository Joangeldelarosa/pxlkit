import { describe, it, expect } from 'vitest';
import {
  adjustBrightness,
  hexToRgb,
  rgbToHex,
  getPerceivedBrightness,
  RETRO_PALETTES,
} from '../../utils/colorUtils';

describe('adjustBrightness', () => {
  it('brightens a color with positive amount', () => {
    const result = adjustBrightness('#000000', 50);
    expect(result).toBe('#323232');
  });

  it('darkens a color with negative amount', () => {
    const result = adjustBrightness('#FFFFFF', -50);
    expect(result).toBe('#CDCDCD');
  });

  it('clamps at 0 (no negative RGB values)', () => {
    const result = adjustBrightness('#000000', -100);
    expect(result).toBe('#000000');
  });

  it('clamps at 255 (no overflow)', () => {
    const result = adjustBrightness('#FFFFFF', 100);
    expect(result).toBe('#FFFFFF');
  });

  it('returns uppercase hex', () => {
    const result = adjustBrightness('#ff0000', 10);
    expect(result).toBe(result.toUpperCase());
  });

  it('handles zero amount (no change)', () => {
    const result = adjustBrightness('#FF8800', 0);
    expect(result).toBe('#FF8800');
  });
});

describe('hexToRgb', () => {
  it('converts #FF0000 to red', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('converts #00FF00 to green', () => {
    expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('converts #0000FF to blue', () => {
    expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('converts #000000 to black', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('converts #FFFFFF to white', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
  });
});

describe('rgbToHex', () => {
  it('converts red (255, 0, 0) to #FF0000', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#FF0000');
  });

  it('converts black (0, 0, 0) to #000000', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
  });

  it('converts white (255, 255, 255) to #FFFFFF', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#FFFFFF');
  });

  it('returns uppercase hex with # prefix', () => {
    const result = rgbToHex(128, 64, 32);
    expect(result).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('round-trips with hexToRgb', () => {
    const original = '#1A2B3C';
    const { r, g, b } = hexToRgb(original);
    expect(rgbToHex(r, g, b)).toBe(original);
  });
});

describe('getPerceivedBrightness', () => {
  it('returns 255 for white', () => {
    expect(getPerceivedBrightness('#FFFFFF')).toBe(255);
  });

  it('returns 0 for black', () => {
    expect(getPerceivedBrightness('#000000')).toBe(0);
  });

  it('returns ~76.245 for pure red', () => {
    // (255 * 299 + 0 * 587 + 0 * 114) / 1000 = 76245 / 1000 = 76.245
    expect(getPerceivedBrightness('#FF0000')).toBeCloseTo(76.245, 1);
  });

  it('returns a number between 0 and 255', () => {
    const brightness = getPerceivedBrightness('#8040FF');
    expect(brightness).toBeGreaterThanOrEqual(0);
    expect(brightness).toBeLessThanOrEqual(255);
  });
});

describe('RETRO_PALETTES', () => {
  it('has all expected palette keys', () => {
    expect(RETRO_PALETTES).toHaveProperty('nes');
    expect(RETRO_PALETTES).toHaveProperty('gameboy');
    expect(RETRO_PALETTES).toHaveProperty('cga');
    expect(RETRO_PALETTES).toHaveProperty('pico8');
    expect(RETRO_PALETTES).toHaveProperty('sweetie16');
  });

  it('each palette has name and colors array', () => {
    Object.values(RETRO_PALETTES).forEach((palette) => {
      expect(typeof palette.name).toBe('string');
      expect(Array.isArray(palette.colors)).toBe(true);
      expect(palette.colors.length).toBeGreaterThan(0);
    });
  });

  it('gameboy has exactly 4 colors', () => {
    expect(RETRO_PALETTES.gameboy.colors).toHaveLength(4);
  });

  it('pico8 has exactly 16 colors', () => {
    expect(RETRO_PALETTES.pico8.colors).toHaveLength(16);
  });

  it('all colors in all palettes are valid #RRGGBB hex format', () => {
    const hexPattern = /^#[0-9A-F]{6}$/;
    Object.entries(RETRO_PALETTES).forEach(([name, palette]) => {
      palette.colors.forEach((color) => {
        expect(color, `${name}: ${color} is not valid #RRGGBB`).toMatch(
          hexPattern
        );
      });
    });
  });
});
