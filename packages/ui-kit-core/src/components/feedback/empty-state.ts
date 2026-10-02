/** PixelEmptyState — a dashed, centred placeholder for an empty collection. */
import { cn, surfaceClasses, type Surface } from '../../common';

export interface EmptyStateClasses {
  root: string;
  /** Wrapper of the decorative icon. */
  icon: string;
  title: string;
  description: string;
  /** Wrapper of the call to action. */
  action: string;
}

/** Classes of every part of the empty state for a surface. */
export function emptyStateClasses(surface: Surface): EmptyStateClasses {
  const s = surfaceClasses(surface);
  return {
    root: cn('border-dashed border-retro-border/60 bg-retro-surface/20 p-8 text-center', s.border, s.radiusLg),
    icon: 'mb-3 flex items-center justify-center text-retro-cyan',
    title: cn('text-sm font-semibold text-retro-text', s.font),
    description: 'mx-auto mt-2 max-w-sm text-sm text-retro-muted',
    action: 'mt-5',
  };
}
