import React, { forwardRef, useMemo } from 'react';
import {
  PAGINATION_ELLIPSIS,
  paginationClasses,
  paginationEllipsisClasses,
  paginationPageClasses,
  paginationStepClasses,
  paginationSteps,
  paginationWindow,
} from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface } from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelPagination — windowed page-number buttons with first/last + ellipses.
   ───────────────────────────────────────────────────────────────────────── */

/** Public prop bag for {@link PixelPagination}. */
export interface PixelPaginationProps {
  /** Current page (1-indexed). */
  page: number;
  /** Total number of pages. */
  total: number;
  /** Fires when the user picks a new page. */
  onChange: (next: number) => void;
  /** Sibling pages to show around the current. Defaults to 1. */
  siblings?: number;
  /** Visual surface treatment override. */
  surface?: Surface;
  /** Accessible label for the nav region. */
  ariaLabel?: string;
  /** Localised label for the Prev button. */
  prevLabel?: string;
  /** Localised label for the Next button. */
  nextLabel?: string;
}

export const PixelPagination = forwardRef<HTMLElement, PixelPaginationProps>(function PixelPagination(
  { page, total, onChange, siblings = 1, surface: surfaceProp, ariaLabel = 'Pagination', prevLabel = 'Prev', nextLabel = 'Next' },
  ref,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const pages = useMemo(() => paginationWindow(page, total, siblings), [page, total, siblings]);
  const { prev, next } = paginationSteps(page, total);

  return (
    <nav ref={ref} aria-label={ariaLabel} className={paginationClasses}>
      <button
        type="button"
        disabled={prev.disabled}
        aria-label={prevLabel}
        onClick={() => onChange(prev.page)}
        className={paginationStepClasses(surface, prev.disabled)}
      >
        {prevLabel}
      </button>
      {pages.map((p, idx) =>
        p === PAGINATION_ELLIPSIS ? (
          <span key={`ell-${idx}`} aria-hidden className={paginationEllipsisClasses(surface)}>
            {PAGINATION_ELLIPSIS}
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            className={paginationPageClasses(surface, p === page)}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={next.disabled}
        aria-label={nextLabel}
        onClick={() => onChange(next.page)}
        className={paginationStepClasses(surface, next.disabled)}
      >
        {nextLabel}
      </button>
    </nav>
  );
});

PixelPagination.displayName = 'PixelPagination';
