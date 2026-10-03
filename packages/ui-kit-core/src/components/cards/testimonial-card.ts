/**
 * PixelTestimonialCard — social proof: a star rating and a verified badge,
 * the quote, actions, and the attribution with its avatar or initials.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { tone as toneTokens, type ToneKey } from '../../tokens';

/** Minimum height of the quote, so cards in a row line up. */
export type TestimonialQuoteSize = 'compact' | 'normal' | 'long';
/** `card` draws the surface chrome; `quote` and `slider` leave it out. */
export type TestimonialVariant = 'card' | 'quote' | 'slider';

export interface TestimonialAvatar {
  /** Photo; the initials of `name` without one. */
  src?: string;
  /** Alternative text of the photo, and the source of the initials. */
  name: string;
  /** Tone of the initials; the card's when left out. */
  tone?: ToneKey;
}

export const testimonialQuoteSizeClasses: Record<TestimonialQuoteSize, string> = {
  compact: 'min-h-[5em]',
  normal: 'min-h-[7em]',
  long: 'min-h-[9em]',
};

/** Accessible name of the verified badge. */
export const TESTIMONIAL_VERIFIED_LABEL = 'Verified';
/** Visible text of the verified badge. */
export const TESTIMONIAL_VERIFIED_TEXT = 'VERIFIED';

/** Up to two initials: the first and last word's, or a single word's first two letters; `?` for no name. */
export function testimonialInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** The line under the name: role and company, joined by a middle dot. */
export function testimonialAttribution(role: string | undefined, company: string | undefined): string {
  return [role, company].filter(Boolean).join(' · ');
}

/** Whether the card shows its star rating: only for a positive number of stars. */
export function testimonialHasStars(stars: number | undefined): stars is number {
  return typeof stars === 'number' && stars > 0;
}

export interface TestimonialCardOptions {
  variant: TestimonialVariant;
  /** Tone of the card's accents and, by default, of the initials. */
  tone: ToneKey;
  /** Tone of the initials, over the card's. */
  avatarTone?: ToneKey;
  quoteSize: TestimonialQuoteSize;
}

export interface TestimonialCardClasses {
  root: string;
  /** The row of the star rating and the verified badge. */
  header: string;
  /** Wrapper of the star rating. */
  stars: string;
  verified: string;
  verifiedIcon: string;
  /** The row that reserves the quote's height. */
  quoteRow: string;
  quote: string;
  /** The row that holds the actions, empty without them. */
  actionsRow: string;
  actions: string;
  /** The row of avatar, name and role. */
  attribution: string;
  avatar: string;
  avatarImage: string;
  /** The column of name and role. */
  person: string;
  name: string;
  role: string;
  /** Keeps the tone's text class in the markup for highlight extensions; hidden. */
  toneHint: string;
}

/** Classes of every part of the testimonial card. */
export function testimonialCardClasses(
  surface: Surface,
  { variant, tone, avatarTone, quoteSize }: TestimonialCardOptions,
): TestimonialCardClasses {
  const s = surfaceClasses(surface);
  const card = variant === 'card';
  const a = toneTokens[avatarTone ?? tone];
  const verified = toneTokens.green;
  return {
    root: cn(
      'relative grid grid-rows-[auto_1fr_auto_auto] gap-3 p-5',
      card && s.border,
      card && s.radiusLg,
      card && 'border-retro-border bg-retro-surface/40',
      s.font,
    ),
    header: 'flex items-center justify-between gap-2 min-h-[1.25rem]',
    stars: 'flex items-center',
    verified: cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold',
      s.border,
      s.radius,
      s.fontDisplay,
      verified.border,
      verified.bg,
      verified.text,
    ),
    verifiedIcon: 'h-2.5 w-2.5',
    quoteRow: cn('flex items-start', testimonialQuoteSizeClasses[quoteSize]),
    quote: cn('text-sm leading-relaxed text-retro-text', s.font),
    actionsRow: 'min-h-0',
    actions: 'pt-1',
    attribution: 'flex items-center gap-3 pt-1',
    avatar: cn(
      'inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden text-xs font-semibold',
      s.border,
      s.radiusFull,
      a.border,
      a.bg,
      a.text,
      s.fontDisplay,
    ),
    avatarImage: 'h-full w-full object-cover',
    person: 'flex min-w-0 flex-col',
    name: cn('truncate text-sm font-semibold text-retro-text', s.font),
    role: cn('truncate text-xs text-retro-muted', s.font),
    toneHint: cn('hidden', toneTokens[tone].text),
  };
}
