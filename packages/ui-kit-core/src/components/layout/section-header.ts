/**
 * PixelSectionHeader — the header above a section: an eyebrow, the heading,
 * a description and actions, on a spacing rhythm.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { rhythm, tone as toneTokens, type ToneKey } from '../../tokens';

export type SectionHeaderAlign = 'start' | 'center';
export type SectionHeaderSize = 'sm' | 'md' | 'lg';
export type SectionHeaderSpacing = 'tight' | 'normal' | 'loose';
/** Heading level of the title. */
export type SectionHeaderLevel = 'h1' | 'h2' | 'h3' | 'h4';

export const sectionHeaderTitleSizeClasses: Record<SectionHeaderSize, string> = {
  sm: 'text-xl sm:text-2xl',
  md: 'text-2xl sm:text-3xl',
  lg: 'text-3xl sm:text-4xl lg:text-5xl',
};

export const sectionHeaderEyebrowSizeClasses: Record<SectionHeaderSize, string> = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-xs sm:text-sm',
};

export const sectionHeaderDescriptionSizeClasses: Record<SectionHeaderSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base sm:text-lg',
};

/** Gaps between the blocks; `normal` follows the page `rhythm`. */
export const sectionHeaderSpacingClasses: Record<
  SectionHeaderSpacing,
  { eyebrowToTitle: string; titleToDescription: string; descriptionToActions: string }
> = {
  tight: {
    eyebrowToTitle: 'mt-2',
    titleToDescription: 'mt-2',
    descriptionToActions: 'mt-4',
  },
  normal: {
    eyebrowToTitle: rhythm.eyebrowToHeadline,
    titleToDescription: rhythm.headlineToSubline,
    descriptionToActions: rhythm.sublineToCtas,
  },
  loose: {
    eyebrowToTitle: 'mt-6',
    titleToDescription: 'mt-5',
    descriptionToActions: 'mt-10',
  },
};

export interface SectionHeaderOptions {
  /** Tone of the title and eyebrow; plain text colours when left out. */
  titleTone?: ToneKey;
  align: SectionHeaderAlign;
  size: SectionHeaderSize;
  spacing: SectionHeaderSpacing;
  /** An eyebrow sits above the title, which then keeps its distance. */
  eyebrow: boolean;
}

export interface SectionHeaderClasses {
  /** The `<header>`. */
  header: string;
  /** The column of blocks inside. */
  stack: string;
  eyebrow: string;
  title: string;
  description: string;
  actions: string;
}

/** The parts of the header. */
export function sectionHeaderClasses(
  surface: Surface,
  { titleTone, align, size, spacing, eyebrow }: SectionHeaderOptions,
): SectionHeaderClasses {
  const s = surfaceClasses(surface);
  const sp = sectionHeaderSpacingClasses[spacing];
  const centered = align === 'center';
  return {
    header: 'w-full',
    stack: cn('flex flex-col', centered && 'mx-auto text-center items-center max-w-3xl'),
    // The display face without its letter-spacing: the eyebrow sets its own.
    eyebrow: cn(
      sectionHeaderEyebrowSizeClasses[size],
      surface === 'pixel' ? 'font-pixel' : 'font-semibold',
      'uppercase tracking-[0.18em]',
      titleTone ? toneTokens[titleTone].text : 'text-retro-muted',
    ),
    title: cn(
      sectionHeaderTitleSizeClasses[size],
      s.fontDisplay,
      'font-bold leading-tight',
      titleTone ? toneTokens[titleTone].text : 'text-retro-text',
      eyebrow && sp.eyebrowToTitle,
    ),
    description: cn(
      sectionHeaderDescriptionSizeClasses[size],
      s.font,
      'text-retro-muted leading-relaxed max-w-prose',
      sp.titleToDescription,
      centered && 'mx-auto',
    ),
    actions: cn('flex flex-wrap gap-3', sp.descriptionToActions, centered && 'justify-center'),
  };
}
