import { describe, expect, it } from 'vitest';
import { cornerShadowClasses, focusRing, iconButtonClasses, iconButtonIconClasses, sizeSquare, surfaceClasses, toneMap } from '../../../index';

describe('icon button recipes', () => {
  it('draws a square of the size in the tone, with the surface tokens and the shadows of its corners', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const c = cornerShadowClasses(surface);
      const t = toneMap.gold;
      expect(iconButtonClasses(surface, { tone: 'gold', size: 'lg', disabled: false })).toBe(
        [
          'inline-flex items-center justify-center focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed',
          s.border,
          s.radius,
          s.transition,
          sizeSquare.lg,
          t.text,
          t.border,
          t.bg,
          t.hover,
          focusRing,
          t.ring,
          c.shadow,
          c.shadowHover,
          c.shadowActive,
        ]
          .filter(Boolean)
          .join(' '),
      );
    }
  });

  it('moves a pixel button on hover and press without the drop shadow its cut corners would clip', () => {
    const classes = iconButtonClasses('pixel', { tone: 'cyan', size: 'md', disabled: false }).split(' ');
    expect(classes).toEqual(expect.arrayContaining(['pxl-corner-sm', 'pxl-nudge-hover', 'pxl-nudge-active']));
    for (const shadow of ['pxl-shadow', 'pxl-shadow-hover', 'pxl-shadow-active']) expect(classes).not.toContain(shadow);
    const linear = iconButtonClasses('linear', { tone: 'cyan', size: 'md', disabled: false }).split(' ');
    expect(linear).toEqual(expect.arrayContaining(['shadow-sm', 'hover:shadow-md', 'active:shadow-sm']));
  });

  it('drops the shadows and moves of a disabled button', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const c = cornerShadowClasses(surface);
      const classes = iconButtonClasses(surface, { tone: 'cyan', size: 'md', disabled: true }).split(' ');
      expect(classes).toEqual(expect.arrayContaining(['h-10', 'w-10', 'text-retro-cyan']));
      for (const shadow of [s.shadow, s.shadowHover, s.shadowActive, c.shadowHover, c.shadowActive]) {
        expect(classes).not.toContain(shadow);
      }
    }
  });

  it('centres the icon in a box that never shrinks', () => {
    expect(iconButtonIconClasses).toBe('inline-flex items-center justify-center shrink-0 leading-none');
  });
});
