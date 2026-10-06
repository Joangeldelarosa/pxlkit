import { describe, expect, it } from 'vitest';
import {
  fieldBase,
  focusRing,
  passwordInputClasses,
  sizeHeight,
  surfaceClasses,
  toneMap,
  type Size,
  type Surface,
} from '../../../index';

const SURFACES: Surface[] = ['pixel', 'linear'];
const SIZES: Size[] = ['sm', 'md', 'lg'];

describe('password input recipes', () => {
  it('pads the input on the right for the toggle', () => {
    for (const surface of SURFACES) {
      for (const size of SIZES) {
        const s = surfaceClasses(surface);
        expect(passwordInputClasses(surface, { tone: 'gold', size, invalid: false }).input).toBe(
          `${fieldBase} ${s.font} ${s.border} ${s.radius} ${s.transition} ${sizeHeight[size]} ${focusRing} ${toneMap.gold.ring} border-retro-border-strong px-3 pr-16`,
        );
      }
    }
    expect(passwordInputClasses('pixel', { tone: 'neutral', size: 'md', invalid: true }).input).toContain(
      'border-retro-red/60',
    );
  });

  it('sets the toggle inside the input, in the surface font and corners', () => {
    for (const surface of SURFACES) {
      const s = surfaceClasses(surface);
      const c = passwordInputClasses(surface, { tone: 'neutral', size: 'md', invalid: false });
      expect(c.shell).toBe('relative block');
      expect(c.toggle.startsWith('absolute right-1.5 top-1/2 -translate-y-1/2')).toBe(true);
      expect(c.toggle).toContain('disabled:opacity-50');
      expect(c.toggle.endsWith(`${s.font} ${s.radius}`)).toBe(true);
    }
  });
});
