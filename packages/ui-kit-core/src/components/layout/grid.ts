/**
 * PixelGrid — a CSS grid with fixed, responsive or auto-fit / auto-fill
 * columns, row count, gaps and item alignment.
 */
import { cn, surfaceClasses, type Surface } from '../../common';
import { stackGap, type StackGapKey } from '../../tokens';
import { stackAlignClasses, type StackAlign } from './stack';

export type GridColumnCount = 1 | 2 | 3 | 4 | 5 | 6 | 12;
export type GridRowCount = 1 | 2 | 3 | 4 | 5 | 6;
/** `base` applies at every width, the others from that breakpoint up. */
export type GridBreakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';
/** Column count per breakpoint. */
export type GridResponsiveColumns = Partial<Record<GridBreakpoint, GridColumnCount>>;
/** Block-axis alignment of the items in their cells. */
export type GridAlign = Exclude<StackAlign, 'baseline'>;
/** Inline-axis alignment of the items in their cells. */
export type GridJustify = 'start' | 'center' | 'end' | 'stretch';

const BREAKPOINTS: readonly GridBreakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

// Spelled out in full: Tailwind only generates classes it finds verbatim.
/** Column templates per breakpoint and count. */
export const gridColumnClasses: Record<GridBreakpoint, Record<GridColumnCount, string>> = {
  base: {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
  },
  sm: {
    1: 'sm:grid-cols-1',
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
    5: 'sm:grid-cols-5',
    6: 'sm:grid-cols-6',
    12: 'sm:grid-cols-12',
  },
  md: {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    12: 'md:grid-cols-12',
  },
  lg: {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    5: 'lg:grid-cols-5',
    6: 'lg:grid-cols-6',
    12: 'lg:grid-cols-12',
  },
  xl: {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4',
    5: 'xl:grid-cols-5',
    6: 'xl:grid-cols-6',
    12: 'xl:grid-cols-12',
  },
};

export const gridRowClasses: Record<GridRowCount, string> = {
  1: 'grid-rows-1',
  2: 'grid-rows-2',
  3: 'grid-rows-3',
  4: 'grid-rows-4',
  5: 'grid-rows-5',
  6: 'grid-rows-6',
};

/** Gap between columns, on the `stackGap` scale. */
export const gridColumnGapClasses: Record<StackGapKey, string> = {
  0: 'gap-x-0',
  1: 'gap-x-1',
  2: 'gap-x-2',
  3: 'gap-x-3',
  4: 'gap-x-4',
  5: 'gap-x-5',
  6: 'gap-x-6',
  8: 'gap-x-8',
  10: 'gap-x-10',
  12: 'gap-x-12',
  16: 'gap-x-16',
};

/** Gap between rows, on the `stackGap` scale. */
export const gridRowGapClasses: Record<StackGapKey, string> = {
  0: 'gap-y-0',
  1: 'gap-y-1',
  2: 'gap-y-2',
  3: 'gap-y-3',
  4: 'gap-y-4',
  5: 'gap-y-5',
  6: 'gap-y-6',
  8: 'gap-y-8',
  10: 'gap-y-10',
  12: 'gap-y-12',
  16: 'gap-y-16',
};

export const gridJustifyClasses: Record<GridJustify, string> = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end',
  stretch: 'justify-items-stretch',
};

/**
 * Column template classes: one count at every width, or a count per
 * breakpoint (mobile first). Counts outside the scale are left out.
 */
export function gridColumnsClasses(cols: GridColumnCount | GridResponsiveColumns | undefined): string {
  if (cols === undefined) return '';
  if (typeof cols === 'number') return gridColumnClasses.base[cols] ?? '';
  return BREAKPOINTS.flatMap((breakpoint) => {
    const count = cols[breakpoint];
    const classes = count === undefined ? undefined : gridColumnClasses[breakpoint][count];
    return classes ? [classes] : [];
  }).join(' ');
}

export interface GridOptions {
  /** Column count, or a count per breakpoint; ignored by auto-fit / auto-fill. */
  cols?: GridColumnCount | GridResponsiveColumns;
  rows?: GridRowCount;
  /** Gap token (`stackGap`) between rows and columns. */
  gap: StackGapKey;
  /** Gap between columns; with `rowGap`, it replaces `gap`. */
  colGap?: StackGapKey;
  /** Gap between rows; with `colGap`, it replaces `gap`. */
  rowGap?: StackGapKey;
  /** As many columns as fit, empty tracks collapsed (inline column template). */
  autoFit?: boolean;
  /** As many columns as fit, empty tracks kept (inline column template). */
  autoFill?: boolean;
  align?: GridAlign;
  justify?: GridJustify;
}

/** The grid. */
export function gridClasses(surface: Surface, options: GridOptions): string {
  const { cols, rows, gap, colGap, rowGap, autoFit = false, autoFill = false, align, justify } = options;
  const splitGap = colGap !== undefined || rowGap !== undefined;
  return cn(
    'grid',
    !autoFit && !autoFill && gridColumnsClasses(cols),
    rows !== undefined && gridRowClasses[rows],
    !splitGap && stackGap[gap],
    colGap !== undefined && gridColumnGapClasses[colGap],
    rowGap !== undefined && gridRowGapClasses[rowGap],
    align && stackAlignClasses[align],
    justify && gridJustifyClasses[justify],
    surfaceClasses(surface).transition,
  );
}

export interface GridTemplateOptions {
  autoFit?: boolean;
  autoFill?: boolean;
  /** Narrowest column (any CSS length); never wider than the grid. */
  minColWidth: string;
}

/**
 * Inline `grid-template-columns` of an auto-fit (wins over auto-fill) or
 * auto-fill grid, or `undefined` for a grid with column classes.
 */
export function gridTemplateColumns({ autoFit = false, autoFill = false, minColWidth }: GridTemplateOptions): string | undefined {
  if (!autoFit && !autoFill) return undefined;
  return `repeat(${autoFit ? 'auto-fit' : 'auto-fill'}, minmax(min(${minColWidth}, 100%), 1fr))`;
}
