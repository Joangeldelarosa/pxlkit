import { describe, expect, it } from 'vitest';
import {
  boxClasses,
  boxLandmarkWarning,
  boxPaddingClasses,
  boxRadiusClasses,
  surfaceClasses,
  tone,
  type Variant,
} from '../../../index';

const pixel = surfaceClasses('pixel');

describe('box recipes', () => {
  it('maps the padding and radius scales', () => {
    expect(boxPaddingClasses).toEqual({
      none: 'p-0',
      xs: 'px-2 py-1',
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4',
      xl: 'px-8 py-6',
    });
    for (const [radius, classes] of Object.entries(boxRadiusClasses)) expect(classes).toBe(`rounded-${radius}`);
  });

  it('fills solid and soft boxes and leaves outline and ghost ones transparent', () => {
    const fills: Record<Variant, string | null> = { solid: tone.cyan.bg, soft: tone.cyan.soft, outline: null, ghost: null };
    for (const [variant, fill] of Object.entries(fills) as Array<[Variant, string | null]>) {
      const classes = boxClasses('pixel', { tone: 'cyan', variant, padding: 'md' });
      expect(classes.startsWith(`px-4 py-3 ${pixel.radiusLg}`)).toBe(true);
      if (fill) expect(classes).toContain(fill);
      else expect(classes).not.toMatch(/(^| )bg-/);
    }
  });

  it('borders the outline variant unless opted out, and the others on request', () => {
    expect(boxClasses('pixel', { tone: 'gold', variant: 'outline', padding: 'sm' })).toBe(
      `px-3 py-2 ${pixel.radiusLg} ${pixel.border} ${tone.gold.border}`,
    );
    expect(boxClasses('pixel', { tone: 'gold', variant: 'outline', padding: 'sm', border: false })).toBe(
      `px-3 py-2 ${pixel.radiusLg}`,
    );
    expect(boxClasses('pixel', { tone: 'green', variant: 'soft', padding: 'md', border: true })).toBe(
      `px-4 py-3 ${pixel.radiusLg} ${tone.green.soft} ${pixel.border} ${tone.green.border}`,
    );
    expect(boxClasses('pixel', { tone: 'green', variant: 'solid', padding: 'md' })).not.toContain(pixel.border);
    // A ghost box has no tone border to draw.
    expect(boxClasses('pixel', { tone: 'green', variant: 'ghost', padding: 'none', border: true })).toBe(`p-0 ${pixel.radiusLg}`);
  });

  it('takes a fixed radius and the surface shadow', () => {
    const linear = surfaceClasses('linear');
    expect(boxClasses('linear', { tone: 'neutral', variant: 'solid', padding: 'xl', radius: 'full', shadow: true })).toBe(
      `px-8 py-6 rounded-full ${tone.neutral.bg} ${linear.shadow}`,
    );
  });

  it('warns about a landmark box without an accessible name', () => {
    expect(boxLandmarkWarning('section', {})).toBe(
      '[pxlkit] PixelBox as="section" is a landmark/sectioning element but has no accessible name. ' +
        'Add aria-label, aria-labelledby, or title.',
    );
    for (const element of ['nav', 'aside', 'main']) expect(boxLandmarkWarning(element, {})).toContain(`as="${element}"`);
    expect(boxLandmarkWarning('section', { label: 'Stats' })).toBeNull();
    expect(boxLandmarkWarning('nav', { labelledBy: 'nav-title' })).toBeNull();
    expect(boxLandmarkWarning('aside', { title: 'Notes' })).toBeNull();
    expect(boxLandmarkWarning('article', {})).toBeNull();
    expect(boxLandmarkWarning(undefined, {})).toBeNull();
  });
});
