import React, { forwardRef } from 'react';
import { Surface, cn, surfaceClasses, useEffectiveSurface } from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelBreadcrumb — trail with pixel chevron separators.
   ───────────────────────────────────────────────────────────────────────── */

/** Single crumb item for {@link PixelBreadcrumb}. */
export type PixelBreadcrumbItem = {
  /** Visible label for the crumb. */
  label: string;
  /** Optional anchor href — rendered as `<a>` when set without `onClick`. */
  href?: string;
  /** Optional click handler — rendered as `<button>` when set. Takes precedence over `href`. */
  onClick?: () => void;
  /** Marks the current page crumb (rendered as plain text with aria-current). */
  active?: boolean;
};

/** Public prop bag for {@link PixelBreadcrumb}. */
export interface PixelBreadcrumbProps {
  /** Crumbs in order, from root to current page. */
  items: PixelBreadcrumbItem[];
  /** Visual surface treatment override. */
  surface?: Surface;
  /** Accessible label for the nav region. */
  ariaLabel?: string;
}

export const PixelBreadcrumb = forwardRef<HTMLElement, PixelBreadcrumbProps>(function PixelBreadcrumb(
  { items, surface: surfaceProp, ariaLabel = 'Breadcrumb' },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  return (
    <nav ref={ref} aria-label={ariaLabel} className={cn('flex items-center gap-1.5 text-xs', s.font)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            {idx > 0 && (
              surface === 'pixel' ? (
                <svg viewBox="0 0 8 8" className="h-2 w-2 shrink-0 text-retro-border" shapeRendering="crispEdges" fill="currentColor" preserveAspectRatio="xMidYMid meet" aria-hidden style={{ display: 'inline-block', verticalAlign: 'middle', overflow: 'visible' }}>
                  <rect x="2" y="1" width="1" height="1" />
                  <rect x="3" y="2" width="1" height="1" />
                  <rect x="4" y="3" width="2" height="1" />
                  <rect x="3" y="5" width="1" height="1" />
                  <rect x="2" y="6" width="1" height="1" />
                </svg>
              ) : (
                <span aria-hidden className="text-retro-border">/</span>
              )
            )}
            {item.active ? (
              <span aria-current="page" className="text-retro-text font-medium">{item.label}</span>
            ) : item.onClick ? (
              <button type="button" onClick={item.onClick} className="text-retro-muted transition-colors hover:text-retro-green focus:outline-none focus-visible:underline">
                {item.label}
              </button>
            ) : item.href ? (
              <a href={item.href} className="text-retro-muted transition-colors hover:text-retro-green focus:outline-none focus-visible:underline">
                {item.label}
              </a>
            ) : (
              <span className="text-retro-muted">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
});

PixelBreadcrumb.displayName = 'PixelBreadcrumb';
