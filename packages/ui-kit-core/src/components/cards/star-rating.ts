/**
 * PixelStarRating — a row of stars showing a rating out of `max`, read as one
 * image, or rated by clicking a star button. The stars are the gamification
 * Star icon, solid in the tone when filled and dimmed when empty.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

/** Star size: 16, 20 or 24 px. */
export type StarRatingSize = 'sm' | 'md' | 'lg';
/** Colour of the filled stars. */
export type StarRatingTone = 'gold' | 'green';

/** Width and height of a star, in px. */
export const starRatingSizes: Record<StarRatingSize, number> = { sm: 16, md: 20, lg: 24 };

/** Text colour of a filled star's wrapper, for a custom glyph that draws in `currentColor`. */
export const starRatingToneClasses: Record<StarRatingTone, string> = {
  gold: 'text-retro-gold',
  green: 'text-retro-green',
};

/**
 * Colour of the filled Star icon. The icon is an `<img>`, an isolated
 * document `currentColor` does not reach, so it takes the tone's hex (the dark
 * theme's).
 */
export const starRatingToneColors: Record<StarRatingTone, string> = {
  gold: '#FFD700',
  green: '#00FF88',
};

/** Colour of the empty Star icon, dimmed further by its wrapper (`starRatingClasses().muted`). */
export const STAR_RATING_MUTED_COLOR = '#4A4A55';

/** Accessible name of each Star icon. */
export const STAR_RATING_ICON_LABEL = 'star';

/** The rating shown: the value rounded to a whole star, within 0 and `max`. */
export function starRatingValue(value: number | undefined, max: number): number {
  return Math.max(0, Math.min(max, Math.round(value ?? 0)));
}

export interface StarRatingStar {
  /** The rating the star stands for, from 1. */
  value: number;
  /** Within the rating. */
  filled: boolean;
}

/** The `max` stars, the first `rating` of them filled. */
export function starRatingStars(rating: number, max: number): StarRatingStar[] {
  return Array.from({ length: max }, (_, index) => ({ value: index + 1, filled: index < rating }));
}

/** The rating's accessible name: of the image ("4 out of 5"), or of the group of star buttons. */
export function starRatingLabel(rating: number, max: number, interactive: boolean): string {
  return interactive ? `Rating, ${rating} of ${max}` : `${rating} out of ${max}`;
}

/** Accessible name of the star button that rates `value`. */
export function starRatingButtonLabel(value: number, max: number): string {
  return `Rate ${value} of ${max}`;
}

export interface StarRatingClasses {
  root: string;
  /** The row of stars. */
  stars: string;
  /** The "N/M" count beside the stars. */
  count: string;
  /** The wrapper that dims an empty star. */
  muted: string;
}

/** Classes of the rating, its row of stars and its count. */
export function starRatingClasses(surface: Surface): StarRatingClasses {
  const s = surfaceClasses(surface);
  return {
    root: cn('inline-flex items-center gap-1', s.font),
    stars: 'inline-flex items-center gap-0.5',
    count: cn('ml-1 text-xs text-retro-muted', s.font),
    muted: 'opacity-40 inline-flex',
  };
}

export interface StarRatingStarOptions {
  /** A star button rather than a static star. */
  interactive: boolean;
  filled: boolean;
  tone: StarRatingTone;
}

/** Classes of one star: a static one, or a button with a focus ring. Filled stars are in the tone. */
export function starRatingStarClasses(surface: Surface, { interactive, filled, tone }: StarRatingStarOptions): string {
  const color = filled && starRatingToneClasses[tone];
  return interactive
    ? cn(
        'cursor-pointer inline-flex items-center justify-center bg-transparent border-0 p-0',
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-retro-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg',
        color,
        surfaceClasses(surface).transition,
      )
    : cn('inline-flex items-center justify-center', color);
}
