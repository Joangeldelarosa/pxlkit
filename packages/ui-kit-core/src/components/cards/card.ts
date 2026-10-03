/**
 * PixelCard — the container card (an article, a link or a button) with an
 * optional media strip, corner ribbon, title header, description, body and
 * footer, and its Header / Body / Footer parts.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { tone as toneTokens, type ToneKey } from '../../tokens';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
/** Lines the description is clamped to. */
export type CardDescriptionLines = 2 | 3 | 4;

/** A card's badge: its label, and its tone. */
export interface CardBadge {
  label: string;
  tone?: ToneKey;
}

export const cardPaddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-6',
};

/** The clamp, and the height of as many lines, so cards in a grid line up. */
export const cardDescriptionLinesClasses: Record<CardDescriptionLines, string> = {
  2: 'line-clamp-2 min-h-[2em]',
  3: 'line-clamp-3 min-h-[3em]',
  4: 'line-clamp-4 min-h-[4em]',
};

export interface CardOptions {
  /** Tone tint of the border and background; neutral chrome when left out. */
  tone?: ToneKey;
  /** Padding scale; the legacy `p-4` when left out. */
  padding?: CardPadding;
  /** Surface border, radius and background. */
  bordered: boolean;
  /** Hover lift and focus ring. */
  interactive: boolean;
  /** The card is a link: focus ring, no underline. */
  link: boolean;
  /** Has a media strip, which takes the padding off the root. */
  media: boolean;
  /** Has a ribbon badge. */
  badge: boolean;
  /** Has a description under the title. */
  description: boolean;
  descriptionLines?: CardDescriptionLines;
}

export interface CardClasses {
  root: string;
  /** The media strip at the top, outside the padding. */
  media: string;
  /** The column of header, description, body and footer. */
  content: string;
  /** The title header. */
  header: string;
  /** Wrapper of the leading icon in the title header. */
  icon: string;
  title: string;
  description: string;
  body: string;
  footer: string;
}

/** Classes of every part of the card. */
export function cardClasses(
  surface: Surface,
  { tone, padding, bordered, interactive, link, media, badge, description, descriptionLines }: CardOptions,
): CardClasses {
  const s = surfaceClasses(surface);
  const t = tone ? toneTokens[tone] : null;
  const pad = padding ? cardPaddingClasses[padding] : 'p-4';
  return {
    root: cn(
      'relative flex flex-col transition-all',
      bordered && 'bg-retro-surface/60',
      bordered && s.border,
      bordered && s.radiusLg,
      bordered && (t ? t.border : 'border-retro-border/40 hover:border-retro-border/60'),
      bordered && (t ? t.soft : null),
      (media || badge) && 'overflow-hidden',
      interactive && 'cursor-pointer hover:-translate-y-[2px] hover:shadow-lg',
      (interactive || link) &&
        'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-cyan/60',
      link && 'no-underline text-inherit',
      !media && pad,
    ),
    media: '-m-0 overflow-hidden',
    content: cn(media && pad, 'flex flex-1 flex-col'),
    header: cn('flex items-center gap-2 border-b border-retro-border/30 pb-3', description ? 'mb-2' : 'mb-3'),
    icon: 'inline-flex items-center justify-center shrink-0',
    title: cn('text-sm font-semibold text-retro-text', s.font),
    description: cn('mb-3 text-sm text-retro-muted', descriptionLines ? cardDescriptionLinesClasses[descriptionLines] : null),
    body: 'text-sm text-retro-muted',
    footer: 'mt-4 border-t border-retro-border/30 pt-3',
  };
}

/** PixelCard's Header part: the title row, divided from the body. */
export const cardHeaderClasses = 'mb-3 flex items-center gap-2 border-b border-retro-border/30 pb-3';
/** PixelCard's Body part, which takes the free height. */
export const cardBodyClasses = 'flex-1 text-sm text-retro-muted';
/** PixelCard's Footer part, pushed to the bottom. */
export const cardFooterClasses = 'mt-auto border-t border-retro-border/30 pt-3';

/** Whether a key activates an interactive card (`role="button"`): Enter and Space, as on a button. */
export function isCardActivationKey(key: string): boolean {
  return key === 'Enter' || key === ' ';
}
