import { describe, expect, it } from 'vitest';
import {
  cn,
  focusRing,
  inputBase,
  pixelDot,
  sizeClass,
  sizeHeight,
  sizeSquare,
  surfaceClasses,
  toneMap,
  type SurfaceClasses,
  type Tone,
} from '../index';

const TONES: Tone[] = ['green', 'cyan', 'gold', 'red', 'purple', 'pink', 'neutral'];
const SURFACE_KEYS: Array<keyof SurfaceClasses> = [
  'border',
  'radius',
  'radiusLg',
  'radiusFull',
  'shadow',
  'shadowHover',
  'shadowActive',
  'font',
  'fontDisplay',
  'transition',
  'press',
];

describe('surfaceClasses', () => {
  it('defaults to the pixel surface', () => {
    expect(surfaceClasses()).toBe(surfaceClasses('pixel'));
    expect(surfaceClasses().border).toBe('border-2');
    expect(surfaceClasses().radius).toBe('pxl-corner-sm');
  });

  it('resolves the linear surface', () => {
    const s = surfaceClasses('linear');
    expect(s.border).toBe('border');
    expect(s.radius).toBe('rounded-md');
    expect(s.font).toBe('font-sans');
  });

  it('defines every class bundle key for both surfaces', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(Object.keys(s).sort()).toEqual([...SURFACE_KEYS].sort());
      for (const key of SURFACE_KEYS) expect(s[key]).toMatch(/\S/);
    }
  });
});

describe('cn', () => {
  it('joins truthy class names with single spaces', () => {
    expect(cn('a', false, 'b', null, undefined, '', 'c')).toBe('a b c');
  });

  it('returns an empty string when nothing is truthy', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});

describe('class maps', () => {
  it('toneMap covers every tone with every tier', () => {
    expect(Object.keys(toneMap).sort()).toEqual([...TONES].sort());
    for (const tone of TONES) {
      expect(Object.keys(toneMap[tone]).sort()).toEqual(['bg', 'border', 'fill', 'hover', 'ring', 'soft', 'text']);
    }
    expect(toneMap.cyan.text).toBe('text-retro-cyan');
    expect(toneMap.neutral.bg).toBe('bg-retro-surface/70');
  });

  it('size maps cover sm, md and lg', () => {
    for (const map of [sizeClass, sizeHeight, sizeSquare, pixelDot]) {
      expect(Object.keys(map)).toEqual(['sm', 'md', 'lg']);
    }
    expect(sizeClass.md).toBe('h-10 px-4 text-sm gap-2');
  });

  it('exposes the shared focus ring and input base', () => {
    expect(focusRing).toContain('focus-visible:ring-2');
    // The ring is a box-shadow, which forced-colors mode drops: the input
    // keeps a hidden outline that mode shows, not none at all.
    expect(inputBase.split(' ')).toContain('focus-visible:outline-hidden');
    expect(inputBase.split(' ')).not.toContain('outline-none');
  });
});
