import { describe, expect, it } from 'vitest';
import {
  characterCountClasses,
  characterCountText,
  getStringLength,
  showCountMax,
  surfaceClasses,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];

describe('character count', () => {
  it('counts strings by length and numbers by their string form', () => {
    expect(getStringLength('pixel')).toBe(5);
    expect(getStringLength('')).toBe(0);
    expect(getStringLength(12.5)).toBe(4);
    expect(getStringLength(undefined)).toBe(0);
    expect(getStringLength(['a', 'b'])).toBe(0);
  });

  it('reads a limit only from a numeric max', () => {
    expect(showCountMax({ max: 80 })).toBe(80);
    expect(showCountMax({ max: 0 })).toBe(0);
    expect(showCountMax({})).toBeUndefined();
    expect(showCountMax(true)).toBeUndefined();
    expect(showCountMax(false)).toBeUndefined();
    expect(showCountMax(undefined)).toBeUndefined();
    expect(showCountMax(null as unknown as boolean)).toBeUndefined();
  });

  it('shows the count, against the limit when there is one', () => {
    expect(characterCountText(3, undefined)).toBe('3');
    expect(characterCountText(5, 80)).toBe('5/80');
    expect(characterCountText(0, 0)).toBe('0/0');
  });

  it('turns the counter red only past the limit', () => {
    for (const surface of SURFACES) {
      const base = `block text-right text-[10px] text-retro-muted ${surfaceClasses(surface).font}`;
      expect(characterCountClasses(surface, 12, undefined)).toBe(base);
      expect(characterCountClasses(surface, 10, 10)).toBe(base);
      expect(characterCountClasses(surface, 11, 10)).toBe(`${base} text-retro-red`);
    }
  });
});
