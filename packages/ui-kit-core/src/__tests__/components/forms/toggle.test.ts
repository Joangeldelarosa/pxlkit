import { describe, expect, it } from 'vitest';
import {
  focusRing,
  surfaceClasses,
  toggleClasses,
  toggleSizeClasses,
  toggleStateClasses,
  toneMap,
  type Surface,
  type ToggleGroupVariant,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];
const VARIANTS: ToggleGroupVariant[] = ['solid', 'soft', 'outline', 'ghost'];

describe('toggle recipes', () => {
  it('paints a pressed toggle cyan whatever the variant', () => {
    const { bg, text, border } = toneMap.cyan;
    for (const variant of VARIANTS) expect(toggleStateClasses(true, variant)).toBe(`${bg} ${text} ${border}`);
  });

  it('gives each variant its own resting look, soft by default', () => {
    expect(toggleStateClasses(false, 'solid')).toBe('bg-retro-surface/60 text-retro-text border-retro-border');
    expect(toggleStateClasses(false, 'outline')).toContain('bg-transparent text-retro-muted border-retro-border');
    expect(toggleStateClasses(false, 'ghost')).toContain('border-transparent');
    expect(toggleStateClasses(false, 'soft')).toBe('bg-retro-surface/40 text-retro-muted border-retro-border/60 hover:text-retro-text');
    expect(toggleStateClasses(false, 'other' as ToggleGroupVariant)).toBe(toggleStateClasses(false, 'soft'));
  });

  it('composes the button from the surface, size, focus ring and state', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      expect(toggleClasses(surface, { pressed: false, size: 'lg', variant: 'ghost' })).toBe(
        [
          'inline-flex items-center justify-center font-medium focus-visible:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed',
          s.font,
          s.radius,
          s.transition,
          s.border,
          toggleSizeClasses.lg,
          focusRing,
          toneMap.cyan.ring,
          toggleStateClasses(false, 'ghost'),
        ].join(' '),
      );
    }
    expect(Object.keys(toggleSizeClasses)).toEqual(['sm', 'md', 'lg']);
    for (const size of Object.values(toggleSizeClasses)) expect(size).toMatch(/^h-\d+ px-[\d.]+ text-\w+ gap-[\d.]+$/);
  });
});
