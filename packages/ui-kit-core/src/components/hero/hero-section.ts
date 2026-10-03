/**
 * PixelHeroSection — the opening section of a page: eyebrow, headline,
 * subline, calls to action, install snippet and meta line, with media in a
 * second column, behind the text or below it.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { rhythm, tone as toneTokens, type ToneKey } from '../../tokens';
import type { ContainerPadding } from '../layout/container';

/** `centered` and `parallax` centre the text; `split` puts the media in a column beside it. */
export type HeroVariant = 'centered' | 'split' | 'parallax';
/** Type sizes and vertical rhythm. */
export type HeroDensity = 'compact' | 'comfortable';
/** Minimum height of the section. */
export type HeroMinHeight = 'sm' | 'md' | 'lg' | 'fullscreen';
/** Animation of the headline. Reserved: no effect yet. */
export type HeroHeadlineEffect = 'typewriter' | 'glitch' | 'none';
/** Alignment of the text column. */
export type HeroAlign = 'center' | 'start';
/**
 * Where the media goes: in a column beside the text (`split`), behind it
 * (`parallax`), or below it (`stacked`).
 */
export type HeroLayout = 'split' | 'parallax' | 'stacked';

// Spelled out in full: Tailwind only generates classes it finds verbatim.
export const heroMinHeightClasses: Record<HeroMinHeight, string> = {
  sm: 'min-h-[400px]',
  md: 'min-h-[480px]',
  lg: 'min-h-[640px]',
  fullscreen: 'min-h-screen',
};

export const heroHeadlineSizeClasses: Record<HeroDensity, string> = {
  compact: 'text-3xl sm:text-4xl lg:text-5xl',
  comfortable: 'text-4xl sm:text-5xl lg:text-6xl',
};

export const heroEyebrowSizeClasses = 'text-xs sm:text-sm';

export const heroSublineSizeClasses: Record<HeroDensity, string> = {
  compact: 'text-base sm:text-lg',
  comfortable: 'text-lg sm:text-xl',
};

/** The gaps between the parts of the text column, per density. */
export const heroDensityRhythm: Record<
  HeroDensity,
  { eyebrowToHeadline: string; headlineToSubline: string; sublineToCtas: string; ctasToInstall: string; installToMeta: string }
> = {
  compact: {
    eyebrowToHeadline: 'mt-3',
    headlineToSubline: 'mt-2',
    sublineToCtas: 'mt-5',
    ctasToInstall: 'mt-6',
    installToMeta: 'mt-4',
  },
  comfortable: {
    eyebrowToHeadline: rhythm.eyebrowToHeadline,
    headlineToSubline: rhythm.headlineToSubline,
    sublineToCtas: rhythm.sublineToCtas,
    ctasToInstall: rhythm.ctasToMeta,
    installToMeta: rhythm.metaToInstall,
  },
};

/** The text column is centred in the centered and parallax variants. */
export function heroAlign(variant: HeroVariant): HeroAlign {
  return variant === 'centered' || variant === 'parallax' ? 'center' : 'start';
}

/** Where the media goes; a split hero without media stacks. */
export function heroLayout(variant: HeroVariant, hasMedia: boolean): HeroLayout {
  if (variant === 'split') return hasMedia ? 'split' : 'stacked';
  return variant === 'parallax' ? 'parallax' : 'stacked';
}

/** Padding of the section's PixelContainer: tighter when compact. */
export function heroContainerPadding(density: HeroDensity): ContainerPadding {
  return density === 'compact' ? 'md' : 'lg';
}

export interface HeroSectionOptions {
  tone: ToneKey;
  density: HeroDensity;
  minHeight: HeroMinHeight;
  align: HeroAlign;
  /** An eyebrow above the headline sets the headline apart from it. */
  hasEyebrow: boolean;
}

export interface HeroSectionClasses {
  /** The `<section>`. */
  root: string;
  /** The column of text, calls to action, install and meta. */
  text: string;
  eyebrow: string;
  /** The `<h1>`. */
  headline: string;
  subline: string;
  /** Merged into the PixelCluster of calls to action. */
  ctas: string;
  install: string;
  meta: string;
  /** The media below the text (`stacked` layout). */
  media: string;
}

export function heroSectionClasses(
  surface: Surface,
  { tone, density, minHeight, align, hasEyebrow }: HeroSectionOptions,
): HeroSectionClasses {
  const s = surfaceClasses(surface);
  const space = heroDensityRhythm[density];
  const centered = align === 'center';
  return {
    root: cn('relative w-full flex flex-col justify-center', heroMinHeightClasses[minHeight], s.transition),
    text: cn('flex flex-col', centered && 'items-center text-center mx-auto max-w-3xl'),
    eyebrow: cn(
      heroEyebrowSizeClasses,
      s.fontDisplay,
      'uppercase tracking-[0.18em] max-w-full break-words',
      toneTokens[tone].text,
    ),
    headline: cn(
      heroHeadlineSizeClasses[density],
      s.fontDisplay,
      'font-bold leading-tight text-retro-text max-w-full break-words',
      hasEyebrow && space.eyebrowToHeadline,
    ),
    subline: cn(
      heroSublineSizeClasses[density],
      s.font,
      'text-retro-muted leading-relaxed max-w-prose break-words',
      space.headlineToSubline,
      centered && 'mx-auto',
    ),
    ctas: space.sublineToCtas,
    install: cn(space.ctasToInstall, centered && 'mx-auto'),
    meta: cn(space.installToMeta, centered && 'mx-auto'),
    media: cn('mt-10 w-full', centered && 'mx-auto'),
  };
}

/** The media column of a split hero. */
export const heroSplitMediaClasses = 'w-full';

/** The body of a parallax hero, which the media layer fills. */
export const heroParallaxBodyClasses = 'relative w-full';

/** The media of a parallax hero: a decorative layer behind the text, which takes no pointer events. */
export const heroParallaxMediaClasses = 'absolute inset-0 -z-10 overflow-hidden pointer-events-none';
