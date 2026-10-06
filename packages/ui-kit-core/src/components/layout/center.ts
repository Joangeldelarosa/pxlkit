/** PixelCenter — a horizontally centred, width-capped column with page gutters. */
import { cn, surfaceClasses, type Surface } from '../../common';
import { containerWidth, pageGutter, type ContainerWidth, type PageGutter } from '../../tokens';

export type CenterAlign = 'left' | 'center' | 'right';

/** Text alignment of the centred content. */
export const centerAlignClasses: Record<CenterAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export interface CenterOptions {
  /** Width cap (`containerWidth`). */
  maxWidth: ContainerWidth;
  /** Horizontal padding (`pageGutter`). */
  gutter: PageGutter;
  /** Text alignment; inherited when left out. */
  align?: CenterAlign;
  /** `inline-block` instead of `block`. */
  inline?: boolean;
  /** Surface border and radius. */
  bordered?: boolean;
}

/** The centred column. */
export function centerClasses(
  surface: Surface,
  { maxWidth, gutter, align, inline = false, bordered = false }: CenterOptions,
): string {
  const s = surfaceClasses(surface);
  return cn(
    inline ? 'inline-block' : 'block',
    'mx-auto',
    containerWidth[maxWidth],
    pageGutter[gutter],
    align && centerAlignClasses[align],
    bordered && s.border,
    bordered && s.radius,
    bordered && 'border-retro-border',
    s.transition,
  );
}
