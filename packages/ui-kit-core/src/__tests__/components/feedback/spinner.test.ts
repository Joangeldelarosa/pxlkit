import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SPINNER_DEFAULT_LABEL, spinnerAnimation, spinnerClasses, spinnerSizeClasses, tone } from '../../../index';

describe('spinner recipes', () => {
  it('sizes the box and colours it with the tone', () => {
    expect(spinnerSizeClasses).toEqual({ xs: 'h-2.5 w-2.5', sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-6 w-6' });
    expect(spinnerClasses('pixel', 'sm', 'gold').root).toBe(
      `relative inline-flex items-center justify-center align-middle h-3 w-3 ${tone.gold.text}`,
    );
  });

  it('draws a square blade on the pixel surface and a ring as thick as the size on the linear one', () => {
    expect(spinnerClasses('pixel', 'xs', 'cyan').blade).toBe(
      `block h-full w-full border-2 border-retro-border/40 border-t-current border-l-current ${tone.cyan.text}`,
    );
    expect(spinnerClasses('linear', 'xs', 'cyan').blade).toBe(
      `block h-full w-full rounded-full border border-retro-border/40 border-t-current ${tone.cyan.text}`,
    );
    expect(spinnerClasses('linear', 'lg', 'cyan').blade).toContain(' border-2 ');
  });

  it('steps on the pixel surface, spins smoothly on the linear one and holds still for reduced motion', () => {
    expect(spinnerAnimation('pixel', { reducedMotion: false })).toBe('pxl-spinner-steps 0.8s steps(8) infinite');
    expect(spinnerAnimation('linear', { reducedMotion: false })).toBe('pxl-spinner-smooth 0.6s linear infinite');
    expect(spinnerAnimation('pixel', { reducedMotion: true })).toBeUndefined();
    expect(spinnerAnimation('linear', { reducedMotion: true })).toBeUndefined();
  });

  it('turns with keyframes the stylesheet defines', () => {
    const theme = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../../../../styles.css'), 'utf8');
    for (const surface of ['pixel', 'linear'] as const) {
      const [keyframes] = spinnerAnimation(surface, { reducedMotion: false })!.split(' ');
      expect(theme).toMatch(new RegExp(`@keyframes ${keyframes} \\{`));
    }
  });

  it('is named "Loading" by default', () => {
    expect(SPINNER_DEFAULT_LABEL).toBe('Loading');
  });
});
