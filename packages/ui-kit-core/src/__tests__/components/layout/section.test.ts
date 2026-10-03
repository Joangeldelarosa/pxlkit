import { describe, expect, it } from 'vitest';
import { sectionClasses, surfaceClasses } from '../../../index';

const plain = { bordered: false, verticalPadding: 'xl', container: '5xl', horizontalGutter: 'lg' } as const;

describe('section recipes', () => {
  it('pads the section with the vertical rhythm, leaving the gutter to the centred column', () => {
    expect(sectionClasses('pixel', plain).section).toBe('p-4 sm:p-6 py-20 sm:py-28 lg:py-32');
    expect(sectionClasses('pixel', { ...plain, verticalPadding: 'none' }).section).toBe('p-4 sm:p-6 py-0');
  });

  it('takes the gutter itself when it has no centred column', () => {
    expect(sectionClasses('pixel', { ...plain, container: false, horizontalGutter: 'md' }).section).toBe(
      'p-4 sm:p-6 py-20 sm:py-28 lg:py-32 px-4 sm:px-6',
    );
  });

  it('draws the tinted surface chrome when bordered', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const s = surfaceClasses(surface);
      expect(sectionClasses(surface, { ...plain, bordered: true }).section).toBe(
        `p-4 sm:p-6 bg-retro-card/40 ${s.border} ${s.radiusLg} border-retro-border/40 py-20 sm:py-28 lg:py-32`,
      );
    }
  });

  // Regression: the linear title took `text-sm` after the pixel `text-xs`,
  // which Tailwind emits later, so it stayed at the pixel size.
  it('sets the title row in the surface typography', () => {
    expect(sectionClasses('pixel', plain).title).toBe('text-retro-green font-pixel text-xs');
    expect(sectionClasses('linear', plain).title).toBe('text-retro-green font-semibold text-sm');
    expect(sectionClasses('linear', plain).subtitle).toBe(`mt-2 text-sm text-retro-muted ${surfaceClasses('linear').font}`);
  });
});
