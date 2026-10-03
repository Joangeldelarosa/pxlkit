/**
 * PixelDataTable — a TanStack Table rendered as a native table: sortable
 * headers (`aria-sort`), a selection column, skeleton rows, an empty state
 * and a pagination bar. TanStack's state lives in each kit; the core holds
 * the markup's classes, labels and the plain-value state the props use.
 */
import { cn, focusRing, surfaceClasses, type Surface } from '../../common';
import {
  clickableRowClasses,
  tableCellPaddingClasses,
  tableSkeletonClasses,
  TABLE_SKELETON_ROWS,
  type PixelTableDensity,
} from './table';

export type PixelDataTableDensity = PixelTableDensity;

/** Id of the selection column added in front of the consumer's columns. */
export const DATA_TABLE_SELECT_COLUMN = '__select__';

/** Page sizes the "Rows per page" select offers. */
export const DATA_TABLE_PAGE_SIZES: readonly number[] = [5, 10, 20, 50];
export const DATA_TABLE_PAGE_SIZE_LABEL = 'Rows per page';
export const DATA_TABLE_PREVIOUS_PAGE_LABEL = 'Previous page';
export const DATA_TABLE_NEXT_PAGE_LABEL = 'Next page';

/** The select's page sizes: the standard ones, with the current size in order when it is another. */
export function dataTablePageSizes(pageSize: number): number[] {
  return DATA_TABLE_PAGE_SIZES.includes(pageSize)
    ? [...DATA_TABLE_PAGE_SIZES]
    : [...DATA_TABLE_PAGE_SIZES, pageSize].sort((a, b) => a - b);
}

/** A TanStack state updater: the next value, or a function of the previous one. */
export type DataTableUpdater<T> = T | ((previous: T) => T);

/** The value an updater gives from `previous`. */
export function resolveDataTableUpdater<T>(updater: DataTableUpdater<T>, previous: T): T {
  return typeof updater === 'function' ? (updater as (previous: T) => T)(previous) : updater;
}

/** TanStack column filters from the `filtering` prop's column id → value record. */
export function dataTableColumnFilters(filtering: Record<string, string>): Array<{ id: string; value: unknown }> {
  return Object.entries(filtering).map(([id, value]) => ({ id, value }));
}

/** The `filtering` record of TanStack column filters: each value as text. */
export function dataTableFilterRecord(filters: ReadonlyArray<{ id: string; value: unknown }>): Record<string, string> {
  const record: Record<string, string> = {};
  for (const filter of filters) record[filter.id] = String(filter.value ?? '');
  return record;
}

/** `aria-sort` of a header: its direction, `none` when it can sort but does not, nothing otherwise. */
export function dataTableAriaSort(
  direction: false | 'asc' | 'desc',
  canSort: boolean,
): 'ascending' | 'descending' | 'none' | undefined {
  if (direction === 'asc') return 'ascending';
  if (direction === 'desc') return 'descending';
  return canSort ? 'none' : undefined;
}

/** Skeleton rows while loading: up to a page, at most five. */
export function dataTableSkeletonRows(pageSize: number): number {
  return pageSize > 0 ? Math.min(pageSize, TABLE_SKELETON_ROWS) : TABLE_SKELETON_ROWS;
}

/** First and last row numbers of the page ("Showing 6-10 of 12"); 0 when there are no rows. */
export function dataTablePageRange(pageIndex: number, pageSize: number, totalRows: number): { start: number; end: number } {
  return {
    start: totalRows === 0 ? 0 : pageIndex * pageSize + 1,
    end: Math.min(totalRows, (pageIndex + 1) * pageSize),
  };
}

/** The page number shown ("Page 2 of 3"): 0 when there are no pages. */
export function dataTablePageNumber(pageIndex: number, pageCount: number): number {
  return pageCount === 0 ? 0 : pageIndex + 1;
}

export interface DataTableOptions {
  density: PixelTableDensity;
  bordered: boolean;
  stickyHeader: boolean;
}

export interface DataTableClasses {
  /** The scroll container. */
  wrapper: string;
  table: string;
  head: string;
  headCell: string;
  sortButton: string;
  skeletonRow: string;
  skeletonCell: string;
  skeleton: string;
  emptyCell: string;
  cell: string;
}

/** Classes of the table's fixed parts. */
export function dataTableClasses(surface: Surface, { density, bordered, stickyHeader }: DataTableOptions): DataTableClasses {
  const s = surfaceClasses(surface);
  const pad = tableCellPaddingClasses[density];
  return {
    wrapper: cn('overflow-x-auto', bordered && s.border, bordered && s.radius, bordered && 'border-retro-border'),
    table: cn('w-full text-left text-sm', s.font),
    head: cn(
      'bg-retro-surface/60',
      surface === 'pixel' ? 'border-b-2 border-retro-border' : 'border-b border-retro-border',
      stickyHeader && 'sticky top-0 z-10',
    ),
    headCell: cn('whitespace-nowrap text-xs font-semibold text-retro-muted', pad),
    sortButton: cn(
      'inline-flex items-center gap-1 text-left text-retro-muted hover:text-retro-text outline-none',
      focusRing,
      s.transition,
    ),
    skeletonRow: 'border-b border-retro-border/20',
    skeletonCell: pad,
    skeleton: tableSkeletonClasses(surface),
    emptyCell: cn('text-center text-retro-muted', pad),
    cell: cn('text-retro-text', pad),
  };
}

export interface DataTablePaginationClasses {
  /** The bar under the table. */
  bar: string;
  pageSizeSelect: string;
  pageButton: string;
}

/** Classes of the pagination bar. */
export function dataTablePaginationClasses(surface: Surface): DataTablePaginationClasses {
  const s = surfaceClasses(surface);
  return {
    bar: cn(
      'flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs text-retro-muted',
      s.font,
      surface === 'pixel' ? 'border-t-2 border-retro-border' : 'border-t border-retro-border',
    ),
    pageSizeSelect: cn(
      'bg-retro-surface/40 px-1 py-0.5 text-retro-text outline-none',
      s.border,
      s.radius,
      focusRing,
      'border-retro-border-strong',
    ),
    pageButton: cn(
      'px-2 py-1 text-retro-text outline-none disabled:opacity-50 disabled:cursor-not-allowed',
      s.border,
      s.radius,
      focusRing,
      'border-retro-border-strong hover:bg-retro-surface/40',
    ),
  };
}

export interface DataTableRowState {
  index: number;
  clickable: boolean;
  selected: boolean;
}

/** A body row: tinted on odd rows, pointer when clickable, highlighted when selected. */
export function dataTableRowClasses({ index, clickable, selected }: DataTableRowState): string {
  return cn(
    'border-b border-retro-border/20 transition-colors',
    clickable && clickableRowClasses,
    index % 2 === 1 && 'bg-retro-surface/15',
    'hover:bg-retro-surface/30',
    selected && 'bg-retro-surface/40',
  );
}

/** One glyph of a sort button: bright for the active direction. */
export function dataTableSortGlyphClasses(dir: 'asc' | 'desc', active: false | 'asc' | 'desc'): string {
  return cn('h-2 w-2', cn(dir === 'asc' ? 'text-retro-muted/50' : 'text-retro-muted/50 -mt-0.5', dir === active && 'text-retro-text'));
}
