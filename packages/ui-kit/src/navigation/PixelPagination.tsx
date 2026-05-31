import React, { forwardRef, useMemo } from 'react';
import { Surface, cn, surfaceClasses, useEffectiveSurface } from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelPagination — windowed page-number buttons with first/last + ellipses.
   ───────────────────────────────────────────────────────────────────────── */

const ELLIPSIS = '…';

/** Builds a windowed sequence like [1, '…', 4, 5, 6, '…', 20]. */
function buildPageWindow(page: number, total: number, siblings = 1): Array<number | typeof ELLIPSIS> {
  const out: Array<number | typeof ELLIPSIS> = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) out.push(i);
    return out;
  }
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  out.push(1);
  if (left > 2) out.push(ELLIPSIS);
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - 1) out.push(ELLIPSIS);
  out.push(total);
  return out;
}

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
  const s = surfaceClasses(surface);
  const baseBtn = cn('h-8 text-xs transition-colors', s.font, s.border, s.radius);
  const pages = useMemo(() => buildPageWindow(page, total, siblings), [page, total, siblings]);

  return (
    <nav ref={ref} aria-label={ariaLabel} className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={page <= 1}
        aria-label={prevLabel}
        onClick={() => onChange(Math.max(1, page - 1))}
        className={cn(
          baseBtn, 'inline-flex items-center px-2.5',
          page <= 1 ? 'opacity-50 cursor-not-allowed border-retro-border text-retro-muted' : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
        )}
      >
        {prevLabel}
      </button>
      {pages.map((p, idx) =>
        p === ELLIPSIS ? (
          <span key={`ell-${idx}`} aria-hidden className={cn('h-8 w-8 flex items-center justify-center text-retro-muted', s.font)}>
            {ELLIPSIS}
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              baseBtn, 'w-8',
              p === page
                ? 'border-retro-green/50 bg-retro-green/10 text-retro-green'
                : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
            )}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        disabled={page >= total}
        aria-label={nextLabel}
        onClick={() => onChange(Math.min(total, page + 1))}
        className={cn(
          baseBtn, 'inline-flex items-center px-2.5',
          page >= total ? 'opacity-50 cursor-not-allowed border-retro-border text-retro-muted' : 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text',
        )}
      >
        {nextLabel}
      </button>
    </nav>
  );
});

PixelPagination.displayName = 'PixelPagination';
