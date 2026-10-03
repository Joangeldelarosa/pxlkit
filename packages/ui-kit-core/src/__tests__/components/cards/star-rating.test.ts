import { describe, expect, it } from 'vitest';
import {
  STAR_RATING_ICON_LABEL,
  STAR_RATING_MUTED_COLOR,
  starRatingButtonLabel,
  starRatingClasses,
  starRatingLabel,
  starRatingSizes,
  starRatingStarClasses,
  starRatingStars,
  starRatingToneClasses,
  starRatingToneColors,
  starRatingValue,
  surfaceClasses,
} from '../../../index';

describe('star rating', () => {
  it('rounds the value to a whole star within 0 and max', () => {
    expect(starRatingValue(undefined, 5)).toBe(0);
    expect(starRatingValue(3.4, 5)).toBe(3);
    expect(starRatingValue(3.5, 5)).toBe(4);
    expect(starRatingValue(9, 5)).toBe(5);
    expect(starRatingValue(-2, 5)).toBe(0);
  });

  it('lists max stars, the first ones filled', () => {
    expect(starRatingStars(2, 4)).toEqual([
      { value: 1, filled: true },
      { value: 2, filled: true },
      { value: 3, filled: false },
      { value: 4, filled: false },
    ]);
    expect(starRatingStars(0, 0)).toEqual([]);
  });

  it('names the image and the star buttons', () => {
    expect(starRatingLabel(4, 5, false)).toBe('4 out of 5');
    expect(starRatingLabel(3, 5, true)).toBe('Rating, 3 of 5');
    expect(starRatingButtonLabel(2, 7)).toBe('Rate 2 of 7');
    expect(STAR_RATING_ICON_LABEL).toBe('star');
  });

  it('sizes, colours and dims the Star icon', () => {
    expect(starRatingSizes).toEqual({ sm: 16, md: 20, lg: 24 });
    expect(starRatingToneColors).toEqual({ gold: '#FFD700', green: '#00FF88' });
    expect(starRatingToneClasses).toEqual({ gold: 'text-retro-gold', green: 'text-retro-green' });
    expect(STAR_RATING_MUTED_COLOR).toBe('#4A4A55');
    expect(starRatingClasses('pixel').muted).toBe('opacity-40 inline-flex');
  });

  it('lays the stars and the count out in the surface font', () => {
    for (const surface of ['pixel', 'linear'] as const) {
      const { font } = surfaceClasses(surface);
      expect(starRatingClasses(surface)).toEqual({
        root: `inline-flex items-center gap-1 ${font}`,
        stars: 'inline-flex items-center gap-0.5',
        count: `ml-1 text-xs text-retro-muted ${font}`,
        muted: 'opacity-40 inline-flex',
      });
    }
  });

  it('draws filled stars in the tone, and star buttons with a focus ring', () => {
    expect(starRatingStarClasses('pixel', { interactive: false, filled: true, tone: 'green' })).toBe(
      'inline-flex items-center justify-center text-retro-green',
    );
    expect(starRatingStarClasses('pixel', { interactive: false, filled: false, tone: 'green' })).toBe(
      'inline-flex items-center justify-center',
    );
    expect(starRatingStarClasses('linear', { interactive: true, filled: true, tone: 'gold' })).toBe(
      [
        'cursor-pointer inline-flex items-center justify-center bg-transparent border-0 p-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-retro-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
        'text-retro-gold',
        surfaceClasses('linear').transition,
      ].join(' '),
    );
    expect(starRatingStarClasses('pixel', { interactive: true, filled: false, tone: 'gold' })).not.toContain('text-retro-gold');
  });
});
