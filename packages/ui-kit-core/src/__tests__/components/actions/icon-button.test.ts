import { describe, expect, it } from 'vitest';
import { focusRing, iconButtonClasses, iconButtonIconClasses, sizeSquare, surfaceClasses, toneMap } from '../../../index';

describe('icon button recipes', () => {
  it('draws a square of the size in the tone, with the surface tokens and their shadows', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      const t = toneMap.gold;
      expect(iconButtonClasses(surface, { tone: 'gold', size: 'lg', disabled: false })).toBe(
        [
          'inline-flex items-center justify-center outline-none disabled:opacity-50 disabled:cursor-not-allowed',
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
          s.shadow,
          s.shadowHover,
          s.shadowActive,
        ].join(' '),
      );
    }
  });

  it('drops the shadows of a disabled button', () => {
    const s = surfaceClasses('pixel');
    const classes = iconButtonClasses('pixel', { tone: 'cyan', size: 'md', disabled: true }).split(' ');
    expect(classes).toEqual(expect.arrayContaining(['h-10', 'w-10', 'text-retro-cyan']));
    for (const shadow of [s.shadow, s.shadowHover, s.shadowActive]) expect(classes).not.toContain(shadow);
  });

  it('centres the icon in a box that never shrinks', () => {
    expect(iconButtonIconClasses).toBe('inline-flex items-center justify-center shrink-0 leading-none');
  });
});
