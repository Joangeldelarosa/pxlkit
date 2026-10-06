/**
 * PixelTable — a native table with striped rows, sortable headers
 * (`aria-sort`), single or multiple row selection, sticky header and first
 * column, skeleton rows while loading and an empty state. Also the pieces
 * PixelDataTable shares with it: cell padding, sort glyphs and labels.
 */
import { cn, focusRing, surfaceClasses, type Surface } from '../../common';

export type PixelTableDensity = 'compact' | 'normal' | 'comfortable';
export type PixelTableSortDir = 'asc' | 'desc';
export type PixelTableAlign = 'left' | 'center' | 'right';
export type PixelTableSelection = 'single' | 'multi';

export interface PixelTableSortState {
  key: string;
  dir: PixelTableSortDir;
}

/** The column fields the shared logic reads; each kit adds its own header and cell content. */
export interface TableColumnBase {
  key: string;
  className?: string;
  sortable?: boolean;
  align?: PixelTableAlign;
  /** Pixel width or CSS length. */
  width?: number | string;
}

/** Cell padding by density (PixelTable and PixelDataTable). */
export const tableCellPaddingClasses: Readonly<Record<PixelTableDensity, string>> = {
  compact: 'px-3 py-1',
  normal: 'px-4 py-2.5',
  comfortable: 'px-4 py-4',
};

export const tableAlignClasses: Readonly<Record<PixelTableAlign, string>> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/** A selection checkbox (PixelTable and PixelDataTable). */
export const tableCheckboxClasses = cn('h-4 w-4', focusRing);

/** Skeleton rows shown while loading. */
export const TABLE_SKELETON_ROWS = 5;
export const TABLE_SELECT_ALL_LABEL = 'Select all rows';
/** Visually hidden header of the single-selection column. */
export const TABLE_SELECT_LABEL = 'Select';
export const TABLE_LOADING_LABEL = 'Loading data…';
export const TABLE_EMPTY_LABEL = 'No data.';

/** Accessible name of a row's selection checkbox. */
export function tableRowSelectLabel(id: string): string {
  return `Select row ${id}`;
}

/** Accessible name of a sort button: the header when it is text, the column key otherwise. */
export function tableSortLabel(header: unknown, key: string): string {
  return `Sort by ${typeof header === 'string' ? header : key}`;
}

/** `[x, y, width, height]` of the 8×8 pixel rects of the sort glyphs: up (ascending) and down (descending). */
export const TABLE_SORT_GLYPHS: Readonly<Record<PixelTableSortDir, ReadonlyArray<readonly [number, number, number, number]>>> = {
  asc: [
    [3, 2, 2, 1],
    [2, 3, 1, 1],
    [5, 3, 1, 1],
    [1, 4, 1, 1],
    [6, 4, 1, 1],
  ],
  desc: [
    [1, 2, 1, 1],
    [6, 2, 1, 1],
    [2, 3, 1, 1],
    [5, 3, 1, 1],
    [3, 4, 2, 1],
  ],
};

/** A row's id: `getRowId`'s, else the row's `id`, else its index. */
export function tableRowId<Row>(row: Row, index: number, getRowId?: (row: Row, index: number) => string): string {
  if (getRowId) return getRowId(row, index);
  const record = row as unknown as Record<string, unknown>;
  if (record && typeof record === 'object' && record.id != null) return String(record.id);
  return String(index);
}

/**
 * The rows in sort order: by the sorted column's raw `row[key]` — numbers
 * numerically, anything else as text with numeric collation, empty values
 * first — when that column is sortable; in their own order otherwise.
 */
export function sortTableRows<Row>(
  data: Row[],
  columns: readonly TableColumnBase[],
  sort: PixelTableSortState | undefined,
): Row[] {
  if (!sort) return data;
  const column = columns.find((c) => c.key === sort.key);
  if (!column || !column.sortable) return data;
  const indexed = data.map((row, idx) => ({ row, idx }));
  indexed.sort((a, b) => {
    const av = (a.row as unknown as Record<string, unknown>)[sort.key];
    const bv = (b.row as unknown as Record<string, unknown>)[sort.key];
    let cmp = 0;
    if (av == null && bv == null) cmp = 0;
    else if (av == null) cmp = -1;
    else if (bv == null) cmp = 1;
    else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv;
    else cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sort.dir === 'asc' ? cmp : -cmp;
  });
  return indexed.map((i) => i.row);
}

/** The sort after a click on `key`'s header: ascending first, then flipping. */
export function nextTableSort(current: PixelTableSortState | undefined, key: string): PixelTableSortState {
  return { key, dir: current?.key === key && current.dir === 'asc' ? 'desc' : 'asc' };
}

/** `aria-sort` of a header: only sortable columns have one. */
export function tableAriaSort(
  column: TableColumnBase,
  sort: PixelTableSortState | undefined,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) return undefined;
  if (sort?.key !== column.key) return 'none';
  return sort.dir === 'asc' ? 'ascending' : 'descending';
}

/** The `width` of a column's cells: a number is pixels. */
export function tableColumnWidth(width: number | string | undefined): string | undefined {
  if (width == null) return undefined;
  return typeof width === 'number' ? `${width}px` : width;
}

export interface TableSelectionSummary {
  /** Every row is selected (and there is at least one). */
  all: boolean;
  /** Some rows, not all: the header checkbox is indeterminate. */
  some: boolean;
}

/** How much of `rowIds` is selected. */
export function tableSelectionSummary(rowIds: readonly string[], selected: ReadonlySet<string>): TableSelectionSummary {
  const all = rowIds.length > 0 && rowIds.every((id) => selected.has(id));
  return { all, some: !all && rowIds.some((id) => selected.has(id)) };
}

/** The selection after toggling row `id`: single selection replaces (or clears) it. */
export function toggleTableRow(mode: PixelTableSelection, selected: ReadonlySet<string>, id: string): string[] {
  if (mode === 'single') return selected.has(id) ? [] : [id];
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return Array.from(next);
}

/**
 * Whether a key pressed on a clickable row activates it: Enter and Space, as
 * on a button. Kits listen on the row and act only when the row itself has
 * focus, so a control inside it keeps its own keys.
 */
export function tableRowActivationKey(key: string): boolean {
  return key === 'Enter' || key === ' ';
}

/** Sticky first-column cells: the header's sits above the body's. */
const stickyFirstHead = 'sticky left-0 z-20 bg-retro-surface/80 backdrop-blur-sm';
const stickyFirstBody = 'sticky left-0 z-10 bg-retro-bg';

export interface TableOptions {
  density: PixelTableDensity;
  bordered: boolean;
  stickyHeader: boolean;
  stickyFirstColumn: boolean;
  /** A leading selection column exists. */
  selectable: boolean;
}

export interface TableClasses {
  /** The scroll container. */
  wrapper: string;
  table: string;
  head: string;
  headRow: string;
  /** Header cell of the selection column. */
  selectHead: string;
  /** Body cell of the selection column. */
  selectCell: string;
  sortButton: string;
  skeletonRow: string;
  skeletonCell: string;
  skeleton: string;
  emptyCell: string;
}

/** Classes of the table's fixed parts. */
export function tableClasses(
  surface: Surface,
  { density, bordered, stickyHeader, stickyFirstColumn }: TableOptions,
): TableClasses {
  const s = surfaceClasses(surface);
  const pad = tableCellPaddingClasses[density];
  return {
    wrapper: cn('overflow-x-auto', bordered && s.border, bordered && s.radius, bordered && 'border-retro-border'),
    table: cn('w-full text-left text-sm', s.font),
    head: cn(stickyHeader && 'sticky top-0 z-10'),
    headRow: cn('bg-retro-surface/60', surface === 'pixel' ? 'border-b-2 border-retro-border' : 'border-b border-retro-border'),
    selectHead: cn('whitespace-nowrap text-xs font-semibold text-retro-muted w-10', pad, stickyFirstColumn && stickyFirstHead),
    selectCell: cn('text-retro-text w-10', pad, stickyFirstColumn && stickyFirstBody),
    sortButton: cn('inline-flex items-center text-retro-muted hover:text-retro-text focus-visible:outline-hidden', focusRing),
    skeletonRow: 'border-b border-retro-border/20',
    skeletonCell: pad,
    skeleton: tableSkeletonClasses(surface),
    emptyCell: cn('text-center text-retro-muted', pad),
  };
}

/** A column's header cell; the first one is sticky with `stickyFirstColumn` when no selection column leads. */
export function tableHeadCellClasses(column: TableColumnBase, index: number, options: TableOptions): string {
  return cn(
    'whitespace-nowrap text-xs font-semibold text-retro-muted',
    tableCellPaddingClasses[options.density],
    column.align && tableAlignClasses[column.align],
    options.stickyFirstColumn && !options.selectable && index === 0 ? stickyFirstHead : '',
    column.className,
  );
}

/** A column's body cell. */
export function tableCellClasses(column: TableColumnBase, index: number, options: TableOptions): string {
  return cn(
    'text-retro-text',
    tableCellPaddingClasses[options.density],
    column.align && tableAlignClasses[column.align],
    options.stickyFirstColumn && !options.selectable && index === 0 ? stickyFirstBody : '',
    column.className,
  );
}

export interface TableRowState {
  index: number;
  striped: boolean;
  clickable: boolean;
  selected: boolean;
}

/**
 * A row with `onRowClick`: it takes focus, so it shows it — an outline
 * inside the row, which table rows draw where they ignore a ring's shadow.
 */
export const clickableRowClasses =
  'cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-retro-cyan/60';

/** A body row: tinted on odd rows when striped, pointer when clickable, highlighted when selected. */
export function tableRowClasses({ index, striped, clickable, selected }: TableRowState): string {
  return cn(
    'border-b border-retro-border/20 transition-colors hover:bg-retro-surface/30',
    striped && index % 2 === 1 && 'bg-retro-surface/15',
    clickable && clickableRowClasses,
    selected && 'bg-retro-surface/40',
  );
}

/** One glyph of a sort button: bright for the active direction. */
export function tableSortGlyphClasses(dir: PixelTableSortDir, active: PixelTableSortDir | null): string {
  return cn(dir === 'asc' ? 'h-2 w-2' : 'h-2 w-2 -mt-0.5', dir === active ? 'text-retro-text' : 'text-retro-muted/50');
}

/** A pulsing skeleton bar (PixelTable and PixelDataTable). */
export function tableSkeletonClasses(surface: Surface): string {
  return cn('h-3 w-full motion-safe:animate-pulse bg-retro-surface/60', surface === 'pixel' ? 'rounded-none' : 'rounded');
}
