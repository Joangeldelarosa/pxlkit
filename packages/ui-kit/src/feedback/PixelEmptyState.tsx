import React, { forwardRef } from 'react';
import { emptyStateClasses } from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface } from '../common';

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
  const classes = emptyStateClasses(useEffectiveSurface(surfaceProp));
  return (
    <div ref={ref} className={classes.root}>
      {icon && <div className={classes.icon} aria-hidden>{icon}</div>}
      <h4 className={classes.title}>{title}</h4>
      <p className={classes.description}>{description}</p>
      {action && <div className={classes.action}>{action}</div>}
    </div>
  );
});

PixelEmptyState.displayName = 'PixelEmptyState';
