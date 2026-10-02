/** PixelBento — a responsive grid of bento cells. */
import { cn } from '../../common';
import { stackGap, type StackGapKey } from '../../tokens';

export type BentoColumns = 3 | 4 | 6;

/** Columns per breakpoint, mobile first: the full count from `lg` up. */
export const bentoColumnsClasses: Record<BentoColumns, string> = {
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

/** Inline `grid-auto-rows`: rows at least 160px tall, sharing the rest. */
export const BENTO_AUTO_ROWS = 'minmax(160px, 1fr)';

/** The bento grid. */
export function bentoClasses(columns: BentoColumns, gap: StackGapKey): string {
  return cn('grid', bentoColumnsClasses[columns], stackGap[gap]);
}
