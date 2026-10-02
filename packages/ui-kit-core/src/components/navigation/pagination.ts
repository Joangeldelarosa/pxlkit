/**
 * PixelPagination — the page buttons in a `<nav>` landmark: Prev, a window of
 * page numbers around the current page that always keeps the first and last
 * pages and shows `…` for the pages it leaves out, and Next. Prev and Next are
 * disabled at the ends; the current page carries `aria-current="page"`.
 */
import { cn, surfaceClasses, type Surface } from '../../common';

/** Stands for the pages a window leaves out. */
export const PAGINATION_ELLIPSIS = '…';

/** A page number, or the ellipsis for a gap. */
export type PaginationEntry = number | typeof PAGINATION_ELLIPSIS;

/**
 * The entries to show for `page` of `total` pages: every page when there are
 * at most seven; otherwise the first and last pages, the `siblings` pages on
 * each side of the current one, and an ellipsis for each gap between them. A
 * `page` outside 1…`total` keeps the first and last pages only.
 */
export function paginationWindow(page: number, total: number, siblings = 1): PaginationEntry[] {
  const out: PaginationEntry[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) out.push(i);
    return out;
  }
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  out.push(1);
  if (left > 2) out.push(PAGINATION_ELLIPSIS);
  for (let i = left; i <= right; i++) out.push(i);
  if (right < total - 1) out.push(PAGINATION_ELLIPSIS);
  out.push(total);
  return out;
}

/** Where Prev or Next goes, and whether it is disabled. */
export interface PaginationStep {
  page: number;
  disabled: boolean;
}

/** Prev and Next from `page`: one page back or on, kept inside 1…`total`, and disabled at the ends. */
export function paginationSteps(page: number, total: number): { prev: PaginationStep; next: PaginationStep } {
  return {
    prev: { page: Math.max(1, page - 1), disabled: page <= 1 },
    next: { page: Math.min(total, page + 1), disabled: page >= total },
  };
}

/** The `<nav>`. */
export const paginationClasses = 'inline-flex max-w-full flex-wrap items-center gap-1';

function paginationButtonBase(surface: Surface): string {
  const s = surfaceClasses(surface);
  return cn('h-8 text-xs transition-colors', s.font, s.border, s.radius);
}

const paginationIdleClasses = 'border-retro-border text-retro-muted hover:bg-retro-surface hover:text-retro-text';

/** Prev or Next, dimmed while disabled. */
export function paginationStepClasses(surface: Surface, disabled: boolean): string {
  return cn(
    paginationButtonBase(surface),
    'inline-flex items-center px-2.5',
    disabled ? 'opacity-50 cursor-not-allowed border-retro-border text-retro-muted' : paginationIdleClasses,
  );
}

/** A page number; the current page is green. */
export function paginationPageClasses(surface: Surface, current: boolean): string {
  return cn(
    paginationButtonBase(surface),
    'w-8',
    current ? 'border-retro-green/50 bg-retro-green/10 text-retro-green' : paginationIdleClasses,
  );
}

/** The ellipsis, hidden from assistive technology. */
export function paginationEllipsisClasses(surface: Surface): string {
  return cn('h-8 w-8 flex items-center justify-center text-retro-muted', surfaceClasses(surface).font);
}
