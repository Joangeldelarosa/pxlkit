/**
 * PixelContainer — a full-width page band with vertical rhythm around a
 * centred column (a PixelCenter).
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { sectionRhythm, type PageGutter, type SectionRhythmKey } from '../../tokens';

/** Elements a PixelContainer renders as. */
export type ContainerElement = 'section' | 'main' | 'header' | 'footer' | 'article' | 'aside' | 'div';

/** Vertical rhythm alone, or the horizontal gutter and the vertical rhythm. */
export type ContainerPadding = SectionRhythmKey | { x?: PageGutter; y?: SectionRhythmKey };

/** The gutter of the inner column and the rhythm of the band; `lg` unless given. */
export function resolveContainerPadding(padding: ContainerPadding | null | undefined): {
  x: PageGutter;
  y: SectionRhythmKey;
} {
  if (padding == null) return { x: 'lg', y: 'lg' };
  if (typeof padding === 'string') return { x: 'lg', y: padding };
  return { x: padding.x ?? 'lg', y: padding.y ?? 'lg' };
}

/** The full-width band. */
export function containerClasses(surface: Surface, rhythm: SectionRhythmKey): string {
  return cn('w-full', sectionRhythm[rhythm], surfaceClasses(surface).transition);
}
