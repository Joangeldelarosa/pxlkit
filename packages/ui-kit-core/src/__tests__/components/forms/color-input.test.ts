import { describe, expect, it } from 'vitest';
import {
  DEFAULT_COLOR_PRESETS,
  colorInputClasses,
  colorInputValue,
  colorPresetClasses,
  colorPresetKeydown,
  colorSwatchHex,
  fieldBase,
  focusRing,
  formatColor,
  hexToRgb,
  isColorPresetSelected,
  normalizeHex,
  rgbToHsl,
  sizeHeight,
  surfaceClasses,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];

describe('colour parsing', () => {
  it('normalises hex colours with or without #, in six digits or three', () => {
    expect(normalizeHex('#06B6D4')).toBe('#06b6d4');
    expect(normalizeHex('  06b6d4 ')).toBe('#06b6d4');
    expect(normalizeHex('#abc')).toBe('#aabbcc');
    expect(normalizeHex('fff')).toBe('#ffffff');
    expect(normalizeHex('')).toBeNull();
    expect(normalizeHex('#ab')).toBeNull();
    expect(normalizeHex('#abcd')).toBeNull();
    expect(normalizeHex('#gggggg')).toBeNull();
    expect(normalizeHex('not-a-color')).toBeNull();
  });

  it('reads the channels of a hex colour', () => {
    expect(hexToRgb('#22c55e')).toEqual({ r: 34, g: 197, b: 94 });
    expect(hexToRgb('f00')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('rgb(1, 2, 3)')).toBeNull();
  });

  it('converts channels to hue, saturation and lightness', () => {
    expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 });
    expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 });
    expect(rgbToHsl(255, 0, 128)).toEqual({ h: 330, s: 100, l: 50 });
    expect(rgbToHsl(6, 182, 212)).toEqual({ h: 189, s: 94, l: 43 });
    expect(rgbToHsl(200, 230, 240)).toEqual({ h: 195, s: 57, l: 86 });
    expect(rgbToHsl(128, 128, 128)).toEqual({ h: 0, s: 0, l: 50 });
  });
});

describe('colour values', () => {
  it('writes a hex colour in each format', () => {
    expect(formatColor('#22C55E', 'hex')).toBe('#22c55e');
    expect(formatColor('#22c55e', 'rgb')).toBe('rgb(34, 197, 94)');
    expect(formatColor('#ff0000', 'hsl')).toBe('hsl(0, 100%, 50%)');
    expect(formatColor('teal', 'rgb')).toBe('teal');
  });

  it('writes a picked or typed hex colour in the format, and anything else as it is', () => {
    expect(colorInputValue('ABC', 'hex')).toBe('#aabbcc');
    expect(colorInputValue('#ff0000', 'rgb')).toBe('rgb(255, 0, 0)');
    expect(colorInputValue('not-a-color', 'hsl')).toBe('not-a-color');
  });

  it('shows hex and rgb() values on the swatch, white without a value and black for the rest', () => {
    expect(colorSwatchHex('#ABCDEF')).toBe('#abcdef');
    expect(colorSwatchHex('rgb(34, 197, 94)')).toBe('#22c55e');
    expect(colorSwatchHex('RGB( 300 ,0, 15 )')).toBe('#ff000f');
    expect(colorSwatchHex('hsl(0, 100%, 50%)')).toBe('#000000');
    // A channel too long to be a number reads as 0.
    expect(colorSwatchHex(`rgb(${'9'.repeat(400)}, 0, 255)`)).toBe('#0000ff');
    expect(colorSwatchHex('')).toBe('#ffffff');
  });

  it('marks the preset that is the colour on the swatch', () => {
    expect(isColorPresetSelected('#EF4444', '#ef4444')).toBe(true);
    expect(isColorPresetSelected('#ef4444', '#06b6d4')).toBe(false);
    expect(isColorPresetSelected('tomato', '#000000')).toBe(false);
    expect(DEFAULT_COLOR_PRESETS).toHaveLength(16);
  });
});

describe('colour presets keyboard', () => {
  it('moves along rows and columns of eight, stopping at the ends', () => {
    expect(colorPresetKeydown('ArrowRight', 3, 16)).toEqual({ focus: 4 });
    expect(colorPresetKeydown('ArrowRight', 15, 16)).toEqual({ focus: 15 });
    expect(colorPresetKeydown('ArrowLeft', 0, 16)).toEqual({ focus: 0 });
    expect(colorPresetKeydown('ArrowDown', 3, 16)).toEqual({ focus: 11 });
    expect(colorPresetKeydown('ArrowDown', 11, 16)).toEqual({ focus: 15 });
    expect(colorPresetKeydown('ArrowUp', 11, 16)).toEqual({ focus: 3 });
    expect(colorPresetKeydown('ArrowUp', 3, 16)).toEqual({ focus: 0 });
    expect(colorPresetKeydown('Home', 9, 16)).toEqual({ focus: 0 });
    expect(colorPresetKeydown('End', 2, 6)).toEqual({ focus: 5 });
  });

  it('picks with Enter and Space and leaves other keys alone', () => {
    expect(colorPresetKeydown('Enter', 2, 6)).toEqual({ select: true });
    expect(colorPresetKeydown(' ', 2, 6)).toEqual({ select: true });
    expect(colorPresetKeydown('Tab', 2, 6)).toBeNull();
  });
});

describe('colour input recipes', () => {
  it('composes the trigger and the hex field from the surface and size, red with an error', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const c = colorInputClasses(surface, { size: 'sm', invalid: false, hasValue: true });
      expect(c.trigger).toBe(
        `${fieldBase} ${s.font} ${s.border} ${s.radius} ${s.transition} ${sizeHeight.sm} ${focusRing} flex items-center gap-2 px-2 text-left border-retro-border-strong`,
      );
      expect(c.hex).toBe(`${fieldBase} ${s.font} ${s.border} ${s.radius} h-8 flex-1 px-2 text-xs ${focusRing} border-retro-border-strong`);
      expect(c.native).toBe(`h-8 w-10 cursor-pointer bg-transparent p-0 ${s.border} ${s.radius} border-retro-border-strong`);
      expect(colorInputClasses(surface, { size: 'md', invalid: true, hasValue: true }).hex).toContain('border-retro-red/60');
    }
  });

  it('rounds the samples by surface and mutes the placeholder', () => {
    expect(colorInputClasses('pixel', { size: 'md', invalid: false, hasValue: false }).sample).toBe(
      'inline-block h-5 w-5 shrink-0 border border-retro-border-strong rounded-[2px]',
    );
    const linear = colorInputClasses('linear', { size: 'md', invalid: false, hasValue: false });
    expect(linear.sample).toBe('inline-block h-5 w-5 shrink-0 border border-retro-border-strong rounded');
    expect(linear.value).toBe('min-w-0 flex-1 truncate text-retro-muted');
    expect(colorInputClasses('linear', { size: 'md', invalid: false, hasValue: true }).value).toBe(
      'min-w-0 flex-1 truncate text-retro-text',
    );
    expect([linear.anchor, linear.content, linear.pickers, linear.hexLabel, linear.presets]).toEqual([
      'relative block',
      'w-64 p-2',
      'mb-2 flex items-center gap-2',
      'sr-only font-sans',
      'grid grid-cols-8 gap-1',
    ]);
  });

  it('rings the selected preset', () => {
    expect(colorPresetClasses('pixel', false)).toBe(`h-6 w-6 border border-retro-border-strong rounded-[2px] ${focusRing}`);
    expect(colorPresetClasses('linear', true)).toBe(
      `h-6 w-6 border border-retro-border-strong rounded ${focusRing} ring-2 ring-retro-cyan ring-offset-1 ring-offset-retro-bg`,
    );
  });
});
