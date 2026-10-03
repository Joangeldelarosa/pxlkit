/**
 * PixelFeatureCard — a feature highlight: a badge row, a toned icon frame, a
 * title, a clamped description and a footer, stacked or side by side; an
 * article, a link or a button.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { tone as toneTokens, type ToneKey } from '../../tokens';
import type { CardBadge } from './card';

/** Width of the icon frame, in px. */
export type FeatureCardIconSize = 48 | 56 | 64 | 80;
/** Lines the description is clamped to. */
export type FeatureCardDescriptionLines = 2 | 3 | 4;
export type FeatureCardOrientation = 'vertical' | 'horizontal';

/** The icon frame's width; it is square. */
export const featureCardIconSizeClasses: Record<FeatureCardIconSize, string> = {
  48: 'w-12',
  56: 'w-14',
  64: 'w-16',
  80: 'w-20',
};

/** The clamp, and the height of as many lines, so cards in a grid line up. */
export const featureCardDescriptionLinesClasses: Record<FeatureCardDescriptionLines, string> = {
  2: 'line-clamp-2 min-h-[2lh]',
  3: 'line-clamp-3 min-h-[3lh]',
  4: 'line-clamp-4 min-h-[4lh]',
};

export interface FeatureCardOptions {
  /** Tone of the icon frame. */
  tone: ToneKey;
  orientation: FeatureCardOrientation;
  /** Surface border, radius and background. */
  bordered: boolean;
  /** Hover lift, shadow and focus ring — an interactive card or a link. */
  interactive: boolean;
  iconSize: FeatureCardIconSize;
  /** The badge; its row keeps its height, invisible, without one. */
  badge?: CardBadge;
  /** Lines of description; 3 when left out. */
  descriptionLines?: FeatureCardDescriptionLines;
}

export interface FeatureCardClasses {
  root: string;
  /** The row above the icon that holds the badge. */
  badgeRow: string;
  /** The badge, cyan unless it has a tone. */
  badge: string;
  /** The square, toned frame around the icon. */
  icon: string;
  title: string;
  description: string;
  /** Pushes the footer of a vertical card to the bottom. */
  spacer: string;
  /** The column of title, description and footer beside the icon (horizontal). */
  column: string;
  /** Wrapper of the footer. */
  footer: string;
}

/** Classes of every part of the feature card. */
export function featureCardClasses(
  surface: Surface,
  { tone, orientation, bordered, interactive, iconSize, badge, descriptionLines = 3 }: FeatureCardOptions,
): FeatureCardClasses {
  const s = surfaceClasses(surface);
  const t = toneTokens[tone];
  const b = toneTokens[badge?.tone ?? 'cyan'];
  const horizontal = orientation === 'horizontal';
  return {
    root: cn(
      'relative p-5',
      horizontal ? 'grid grid-cols-[auto_1fr] gap-4 items-start' : 'flex flex-col',
      bordered && s.border,
      bordered && s.radiusLg,
      s.transition,
      bordered && 'border-retro-border bg-retro-surface/40',
      interactive && 'cursor-pointer hover:-translate-y-[2px]',
      interactive && s.shadowHover,
      interactive &&
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-retro-bg focus-visible:ring-retro-cyan/60',
    ),
    badgeRow: cn('min-h-[28px] flex items-center', !badge && 'invisible', horizontal && 'col-span-2'),
    badge: cn('inline-flex items-center px-2.5 py-1 text-[11px] leading-none', s.border, s.radiusFull, s.font, b.text, b.border, b.soft),
    icon: cn(
      'aspect-square flex items-center justify-center',
      featureCardIconSizeClasses[iconSize],
      s.border,
      s.radius,
      t.bg,
      t.border,
      t.text,
      horizontal ? 'self-start' : 'mb-4',
    ),
    title: cn('text-base font-semibold text-retro-text line-clamp-2 min-h-[2lh]', s.fontDisplay),
    description: cn('mt-2 text-sm text-retro-muted', s.font, featureCardDescriptionLinesClasses[descriptionLines]),
    spacer: 'flex-1',
    column: 'min-w-0 flex flex-col',
    footer: cn(!horizontal && 'mt-4'),
  };
}
