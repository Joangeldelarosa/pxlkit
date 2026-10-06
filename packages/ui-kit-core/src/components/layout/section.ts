/**
 * PixelSection — a page section with an optional title row, its content in a
 * centred column or across the full width.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { pageGutter, sectionRhythm, type ContainerWidth, type PageGutter, type SectionRhythmKey } from '../../tokens';

export interface SectionOptions {
  /** Surface border, radius and card tint. */
  bordered: boolean;
  /** Vertical padding (`sectionRhythm`). */
  verticalPadding: SectionRhythmKey;
  /** Width of the centred column, or `false` for the full width. */
  container: ContainerWidth | false;
  /** Horizontal padding (`pageGutter`); on the section itself when it has no column. */
  horizontalGutter: PageGutter;
}

export interface SectionClasses {
  section: string;
  title: string;
  subtitle: string;
}

/** The section and its title row. */
export function sectionClasses(
  surface: Surface,
  { bordered, verticalPadding, container, horizontalGutter }: SectionOptions,
): SectionClasses {
  const s = surfaceClasses(surface);
  return {
    section: cn(
      'p-4 sm:p-6',
      bordered && 'bg-retro-card/40',
      bordered && s.border,
      bordered && s.radiusLg,
      bordered && 'border-retro-border/40',
      sectionRhythm[verticalPadding],
      !container && pageGutter[horizontalGutter],
    ),
    title: cn('text-retro-green', surface === 'pixel' ? 'font-pixel text-xs' : 'font-semibold text-sm'),
    subtitle: cn('mt-2 text-sm text-retro-muted', s.font),
  };
}
