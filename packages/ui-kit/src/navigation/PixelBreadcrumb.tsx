import React, { forwardRef } from 'react';
import {
  breadcrumbChevron,
  breadcrumbClasses,
  breadcrumbCrumbKind,
  breadcrumbCurrentClasses,
  breadcrumbItemClasses,
  breadcrumbLinkClasses,
  breadcrumbListClasses,
  breadcrumbSlashClasses,
  breadcrumbTextClasses,
} from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface } from '../common';

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
  return (
    <nav ref={ref} aria-label={ariaLabel} className={breadcrumbClasses(surface)}>
      <ol className={breadcrumbListClasses}>
        {items.map((item, idx) => {
          const kind = breadcrumbCrumbKind(item);
          return (
            <li key={idx} className={breadcrumbItemClasses}>
              {idx > 0 && (
                surface === 'pixel' ? (
                  <svg viewBox={breadcrumbChevron.viewBox} className={breadcrumbChevron.className} shapeRendering="crispEdges" fill="currentColor" preserveAspectRatio="xMidYMid meet" aria-hidden style={breadcrumbChevron.style}>
                    {breadcrumbChevron.rects.map(([x, y, width, height]) => (
                      <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} />
                    ))}
                  </svg>
                ) : (
                  <span aria-hidden className={breadcrumbSlashClasses}>/</span>
                )
              )}
              {kind === 'current' ? (
                <span aria-current="page" className={breadcrumbCurrentClasses}>{item.label}</span>
              ) : kind === 'button' ? (
                <button type="button" onClick={item.onClick} className={breadcrumbLinkClasses}>
                  {item.label}
                </button>
              ) : kind === 'link' ? (
                <a href={item.href} className={breadcrumbLinkClasses}>
                  {item.label}
                </a>
              ) : (
                <span className={breadcrumbTextClasses}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

PixelBreadcrumb.displayName = 'PixelBreadcrumb';
