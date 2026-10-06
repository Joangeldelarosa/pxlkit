import { describe, expect, it } from 'vitest';
import {
  INPUT_GROUP_UNNAMED_WARNING,
  inputGroupClasses,
  inputGroupItemClasses,
  inputGroupRole,
  sizeHeight,
  surfaceClasses,
  type Size,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];
const SIZES: Size[] = ['sm', 'md', 'lg'];

describe('input group recipes', () => {
  it('draws one shell at the control height', () => {
    for (const surface of SURFACES) {
      for (const size of SIZES) {
        const s = surfaceClasses(surface);
        expect(inputGroupClasses(surface, size)).toBe(
          `inline-flex w-full items-stretch overflow-hidden ${sizeHeight[size]} ${s.border} ${s.radius} border-retro-border/60 bg-retro-surface/40 ${s.font}`,
        );
      }
    }
  });

  // Regression: a control before the last also took the surface's
  // `border-2`, which Tailwind emits after `border-0`, so on the pixel
  // surface it kept a border of its own inside the shell.
  it('strips each control, which shows focus inside the shell that clips it, and divides it from the next, except the last', () => {
    const base = 'min-w-0 border-0 rounded-none focus:z-10 focus-visible:z-10 focus-visible:pxl-focus-inset relative';
    expect(inputGroupItemClasses(true)).toBe(base);
    expect(inputGroupItemClasses(false)).toBe(`${base} border-r border-retro-border/60`);
  });

  it('is a group only when named, unless given its own role', () => {
    expect(inputGroupRole(undefined, true)).toBe('group');
    expect(inputGroupRole(undefined, false)).toBeUndefined();
    expect(inputGroupRole('toolbar', false)).toBe('toolbar');
    expect(INPUT_GROUP_UNNAMED_WARNING).toMatch(/^\[PixelInputGroup\] missing aria-label \/ aria-labelledby\./);
  });
});
