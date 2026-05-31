import React, { forwardRef } from 'react';
import {
  Surface, cn,
  surfaceClasses, useEffectiveSurface,
} from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelEmptyState — empty / no-results placeholder.
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelEmptyState}. */
export interface PixelEmptyStateProps {
  /** Short title (e.g. `"No results"`). */
  title: string;
  /** Supporting description below the title. */
  description: string;
  /** Optional CTA node (button, link). */
  action?: React.ReactNode;
  /** Optional decorative icon. */
  icon?: React.ReactNode;
  /** Surface override; falls back to nearest provider. */
  surface?: Surface;
}

export const PixelEmptyState = forwardRef<HTMLDivElement, PixelEmptyStateProps>(function PixelEmptyState(
  { title, description, action, icon, surface: surfaceProp },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <div ref={ref} className={cn('border-dashed border-retro-border/60 bg-retro-surface/20 p-8 text-center', s.border, s.radiusLg)}>
      {icon && <div className="mb-3 flex items-center justify-center text-retro-cyan" aria-hidden>{icon}</div>}
      <h4 className={cn('text-sm font-semibold text-retro-text', s.font)}>{title}</h4>
      <p className="mx-auto mt-2 max-w-sm text-sm text-retro-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
});

PixelEmptyState.displayName = 'PixelEmptyState';
