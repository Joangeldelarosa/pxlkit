/**
 * PixelHeroMedia — a figure that holds hero media at a fixed aspect ratio,
 * with an optional tone frame and caption.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { tone as toneTokens, type ToneKey } from '../../tokens';

/** Aspect ratio of the media. */
export type HeroMediaRatio = '1/1' | '4/5' | '16/10' | '16/9';
/** Where the figure sits across its row: centred, or on the baseline of a headline next to it (the row's end). */
export type HeroMediaAnchor = 'center' | 'baseline-headline';

/** CSS `aspect-ratio` of each ratio, which reserves the media's box before it loads. */
export const heroMediaRatios: Record<HeroMediaRatio, string> = {
  '1/1': '1 / 1',
  '4/5': '4 / 5',
  '16/10': '16 / 10',
  '16/9': '16 / 9',
};

export interface HeroMediaOptions {
  anchor: HeroMediaAnchor;
  /** Surface border and radius in the tone's border colour. */
  framed: boolean;
  tone: ToneKey;
}

/** The figure. */
export function heroMediaClasses(surface: Surface, { anchor, framed, tone }: HeroMediaOptions): string {
  const s = surfaceClasses(surface);
  return cn(
    'relative flex w-full flex-col overflow-hidden',
    anchor === 'baseline-headline' ? 'self-end' : 'self-center',
    framed && s.border,
    framed && s.radiusLg,
    framed && toneTokens[tone].border,
  );
}

/** The box the media fills. */
export const heroMediaBodyClasses = 'relative w-full flex-1';

/** The caption under the media. */
export function heroMediaCaptionClasses(surface: Surface): string {
  return cn('mt-3 text-xs text-retro-muted', surfaceClasses(surface).font);
}
