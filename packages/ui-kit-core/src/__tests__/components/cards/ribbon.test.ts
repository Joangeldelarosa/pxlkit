import { describe, expect, it } from 'vitest';
import {
  ribbonClasses,
  ribbonPositionClasses,
  ribbonTextClass,
  ribbonTilt,
  ribbonTiltClass,
  ribbonTransform,
  surfaceClasses,
  tone,
  type ToneKey,
} from '../../../index';

const classesOf = (value: string) => value.split(' ');
const TONES = Object.keys(tone) as ToneKey[];

describe('ribbon recipes', () => {
  it('rises above the top edge by the offset, and sits inside a corner whatever the offset', () => {
    expect(ribbonPositionClasses('top-center', 'sm')).toBe('-top-2 left-1/2 -translate-x-1/2');
    expect(ribbonPositionClasses('top-left', 'md')).toBe('-top-3 left-4');
    expect(ribbonPositionClasses('top-right', 'lg')).toBe('-top-4 right-4');
    for (const offset of ['sm', 'md', 'lg'] as const) {
      expect(ribbonPositionClasses('corner-tl', offset)).toBe('top-3 left-3');
      expect(ribbonPositionClasses('corner-tr', offset)).toBe('top-3 right-3');
    }
  });

  it('tilts the corners outwards unless told otherwise', () => {
    expect(ribbonTilt('corner-tl', undefined)).toBe(-12);
    expect(ribbonTilt('corner-tr', undefined)).toBe(12);
    expect(ribbonTilt('top-center', undefined)).toBe(0);
    expect(ribbonTilt('corner-tr', 0)).toBe(0);
    expect(ribbonTilt('top-left', 7)).toBe(7);
  });

  it('rotates by a Tailwind step where there is one, and inline otherwise', () => {
    for (const step of [3, 6, 12, 45]) {
      expect(ribbonTiltClass(step)).toBe(`rotate-${step}`);
      expect(ribbonTiltClass(-step)).toBe(`-rotate-${step}`);
      expect(ribbonTransform(step)).toBeNull();
    }
    expect(ribbonTiltClass(0)).toBeNull();
    expect(ribbonTransform(0)).toBeNull();
    expect(ribbonTiltClass(7)).toBeNull();
    expect(ribbonTransform(7)).toBe('rotate(7deg)');
    expect(ribbonTransform(-2.5)).toBe('rotate(-2.5deg)');
  });

  it('writes light text on purple and red fills, and the page background on the rest', () => {
    expect(TONES.filter((t) => ribbonTextClass(t) === 'text-retro-text')).toEqual(['red', 'purple']);
    expect(ribbonTextClass('neutral')).toBe('text-retro-bg');
    expect(ribbonTextClass('gold')).toBe('text-retro-bg');
  });

  it('paints an opaque tone label that lets the pointer through', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const t = tone.cyan;
      expect(ribbonClasses(surface, { position: 'top-center', tone: 'cyan', offset: 'md' })).toBe(
        [
          'absolute z-10 pointer-events-none select-none',
          'inline-flex items-center px-2 py-1 text-[10px] font-semibold uppercase tracking-wider',
          s.border,
          s.radius,
          s.fontDisplay,
          t.fill,
          t.border,
          'text-retro-bg',
          '-top-3 left-1/2 -translate-x-1/2',
        ].join(' '),
      );
    }
  });

  it('carries the tilt class of the position or of the given tilt', () => {
    expect(classesOf(ribbonClasses('pixel', { position: 'corner-tr', tone: 'red', offset: 'md' }))).toContain('rotate-12');
    expect(classesOf(ribbonClasses('pixel', { position: 'corner-tl', tone: 'red', offset: 'md' }))).toContain('-rotate-12');
    const flat = classesOf(ribbonClasses('pixel', { position: 'corner-tr', tone: 'red', offset: 'md', tilt: 0 }));
    expect(flat.some((name) => name.includes('rotate'))).toBe(false);
    const inline = classesOf(ribbonClasses('pixel', { position: 'top-left', tone: 'red', offset: 'md', tilt: 7 }));
    expect(inline.some((name) => name.includes('rotate'))).toBe(false);
  });
});
