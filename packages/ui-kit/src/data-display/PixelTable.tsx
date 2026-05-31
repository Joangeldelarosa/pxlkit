import React from 'react';
import {
  Surface, cn,
  surfaceClasses, useEffectiveSurface, focusRing,
} from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelTable — data table with striped rows + hover highlight.

   Upgraded (Ola 4a) additively: optional column.sortable/align/render/width,
   controlled sort with header-button + aria-sort, single/multi selection
   with checkbox column, sticky header, sticky first column, skeleton
   loading rows, empty state, row click handler, density scale. Legacy API
   (columns:{key,header,className?} + data:Record<string,ReactNode>) keeps
   rendering exactly as before.
   ───────────────────────────────────────────────────────────────────────── */

export type PixelTableDensity = 'compact' | 'normal' | 'comfortable';
export type PixelTableSortDir = 'asc' | 'desc';
export type PixelTableAlign = 'left' | 'center' | 'right';
export type PixelTableSelection = 'single' | 'multi';

export interface PixelTableColumn<Row = Record<string, React.ReactNode>> {
  /** Stable column id; also the lookup key into a row when `render` is absent. */
  key: string;
  /** Header cell content. */
  header: React.ReactNode;
  /** Extra class names applied to header + body cells in this column. */
  className?: string;
  /** When true, header renders a sort button with aria-sort. Requires `onSortChange`. */
  sortable?: boolean;
  /** Text alignment for header + body cells. */
  align?: PixelTableAlign;
  /** Pixel width or CSS length. */
  width?: number | string;
  /** Custom cell renderer. Overrides the `row[key]` lookup. */
  render?: (row: Row, idx: number) => React.ReactNode;
}

export interface PixelTableSortState {
  key: string;
  dir: PixelTableSortDir;
}

export interface PixelTableProps<Row = Record<string, React.ReactNode>> {
  /** Column definitions. */
  columns: Array<PixelTableColumn<Row>>;
  /** Row data. */
  data: Row[];
  /** Alternate-row tint. Defaults to `true`. */
  striped?: boolean;
  /** Visual surface override. */
  surface?: Surface;
  /** Controlled sort state. */
  sort?: PixelTableSortState;
  /** Called when a sortable header is clicked. */
  onSortChange?: (next: PixelTableSortState) => void;
  /** Enables a leading checkbox column with single- or multi-row selection. */
  selection?: PixelTableSelection;
  /** Controlled list of selected row ids. */
  selectedIds?: string[];
  /** Called when selection changes. */
  onSelectionChange?: (next: string[]) => void;
  /** Resolves a stable id per row. Falls back to `row.id` then to the index. */
  getRowId?: (row: Row, idx: number) => string;
  /** Sticks the header row to the top of the scroll container. */
  stickyHeader?: boolean;
  /** Sticks the first column to the left of the scroll container. */
  stickyFirstColumn?: boolean;
  /** Renders skeleton rows instead of data. */
  loading?: boolean;
  /** Rendered inside a full-width cell when `data` is empty. */
  emptyState?: React.ReactNode;
  /** Called when a body row is clicked. Renders the row with `cursor-pointer`. */
  onRowClick?: (row: Row, idx: number) => void;
  /** Cell padding scale. Defaults to `'normal'`. */
  density?: PixelTableDensity;
}

const tableCellPad: Record<PixelTableDensity, string> = {
  compact: 'px-3 py-1',
  normal: 'px-4 py-2.5',
  comfortable: 'px-4 py-4',
};

const alignClass: Record<PixelTableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function PixelTableSortIcons({ dir }: { dir: PixelTableSortDir | null }) {
  return (
    <span aria-hidden className="inline-flex flex-col leading-none ml-1">
      <svg viewBox="0 0 8 8" shapeRendering="crispEdges" fill="currentColor" className={cn('h-2 w-2', dir === 'asc' ? 'text-retro-text' : 'text-retro-muted/50')}>
        <rect x="3" y="2" width="2" height="1" />
        <rect x="2" y="3" width="1" height="1" />
        <rect x="5" y="3" width="1" height="1" />
        <rect x="1" y="4" width="1" height="1" />
        <rect x="6" y="4" width="1" height="1" />
      </svg>
      <svg viewBox="0 0 8 8" shapeRendering="crispEdges" fill="currentColor" className={cn('h-2 w-2 -mt-0.5', dir === 'desc' ? 'text-retro-text' : 'text-retro-muted/50')}>
        <rect x="1" y="2" width="1" height="1" />
        <rect x="6" y="2" width="1" height="1" />
        <rect x="2" y="3" width="1" height="1" />
        <rect x="5" y="3" width="1" height="1" />
        <rect x="3" y="4" width="2" height="1" />
      </svg>
    </span>
  );
}

export function PixelTable<Row = Record<string, React.ReactNode>>({
  columns,
  data,
  striped = true,
  surface: surfaceProp,
  sort,
  onSortChange,
  selection,
  selectedIds,
  onSelectionChange,
  getRowId,
  stickyHeader,
  stickyFirstColumn,
  loading,
  emptyState,
  onRowClick,
  density = 'normal',
}: PixelTableProps<Row>) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);
  const padCls = tableCellPad[density];
  const hasSelection = selection !== undefined;
  const selectedSet = React.useMemo(() => new Set(selectedIds ?? []), [selectedIds]);

  const resolveRowId = React.useCallback(
    (row: Row, idx: number): string => {
      if (getRowId) return getRowId(row, idx);
      const r = row as unknown as Record<string, unknown>;
      if (r && typeof r === 'object' && r.id != null) return String(r.id);
      return String(idx);
    },
    [getRowId],
  );

  const totalColCount = columns.length + (hasSelection ? 1 : 0);

  const allRowIds = React.useMemo(
    () => data.map((row, idx) => resolveRowId(row, idx)),
    [data, resolveRowId],
  );
  const allSelected = hasSelection && allRowIds.length > 0 && allRowIds.every((id) => selectedSet.has(id));
  const someSelected = hasSelection && !allSelected && allRowIds.some((id) => selectedSet.has(id));

  const headerCheckboxRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () => {
    if (!hasSelection || selection !== 'multi') return;
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(allRowIds);
    }
  };

  const toggleOne = (id: string) => {
    if (!hasSelection) return;
    if (selection === 'single') {
      const next = selectedSet.has(id) ? [] : [id];
      onSelectionChange?.(next);
      return;
    }
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange?.(Array.from(next));
  };

  const handleSortClick = (col: PixelTableColumn<Row>) => {
    if (!col.sortable || !onSortChange) return;
    const isActive = sort?.key === col.key;
    const nextDir: PixelTableSortDir = isActive && sort?.dir === 'asc' ? 'desc' : 'asc';
    onSortChange({ key: col.key, dir: nextDir });
  };

  const stickyFirstHeadCls = stickyFirstColumn ? 'sticky left-0 z-20 bg-retro-surface/80 backdrop-blur-sm' : '';
  const stickyFirstBodyCls = stickyFirstColumn ? 'sticky left-0 z-10 bg-retro-bg' : '';

  const renderCellContent = (col: PixelTableColumn<Row>, row: Row, idx: number): React.ReactNode => {
    if (col.render) return col.render(row, idx);
    const r = row as unknown as Record<string, React.ReactNode>;
    return r?.[col.key] ?? '';
  };

  return (
    <div className={cn('overflow-x-auto', s.border, s.radius, 'border-retro-border')}>
      <table className={cn('w-full text-left text-sm', s.font)}>
        <thead
          className={cn(
            stickyHeader && 'sticky top-0 z-10',
          )}
        >
          <tr className={cn('bg-retro-surface/60', surface === 'pixel' ? 'border-b-2 border-retro-border' : 'border-b border-retro-border')}>
            {hasSelection && (
              <th
                scope="col"
                className={cn('whitespace-nowrap text-xs font-semibold text-retro-muted w-10', padCls, stickyFirstColumn && stickyFirstHeadCls)}
              >
                {selection === 'multi' ? (
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={allSelected}
                    onChange={toggleAll}
                    className={cn('h-4 w-4', focusRing)}
                  />
                ) : (
                  <span className="sr-only">Select</span>
                )}
              </th>
            )}
            {columns.map((col, colIdx) => {
              const isSorted = sort?.key === col.key;
              const ariaSort: React.AriaAttributes['aria-sort'] = col.sortable
                ? (isSorted ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none')
                : undefined;
              const headerStyle: React.CSSProperties | undefined = col.width != null
                ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
                : undefined;
              const headerStickyCls = stickyFirstColumn && !hasSelection && colIdx === 0 ? stickyFirstHeadCls : '';
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort}
                  style={headerStyle}
                  className={cn(
                    'whitespace-nowrap text-xs font-semibold text-retro-muted',
                    padCls,
                    col.align && alignClass[col.align],
                    headerStickyCls,
                    col.className,
                  )}
                >
                  {col.sortable && onSortChange ? (
                    <button
                      type="button"
                      onClick={() => handleSortClick(col)}
                      aria-label={`Sort by ${typeof col.header === 'string' ? col.header : col.key}`}
                      className={cn(
                        'inline-flex items-center text-retro-muted hover:text-retro-text outline-none',
                        focusRing,
                      )}
                    >
                      <span>{col.header}</span>
                      <PixelTableSortIcons dir={isSorted ? sort!.dir : null} />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody aria-busy={loading || undefined}>
          {loading && (
            <tr aria-hidden className="sr-only">
              <td colSpan={totalColCount}>
                <span role="status" aria-live="polite">Loading data…</span>
              </td>
            </tr>
          )}
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`sk-${i}`} className="border-b border-retro-border/20">
                {Array.from({ length: totalColCount }).map((_, j) => (
                  <td key={`sk-${i}-${j}`} className={padCls}>
                    <div
                      data-skeleton
                      aria-hidden
                      className={cn(
                        'h-3 w-full motion-safe:animate-pulse bg-retro-surface/60',
                        surface === 'pixel' ? 'rounded-none' : 'rounded',
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={totalColCount} className={cn('text-center text-retro-muted', padCls)}>
                {emptyState ?? <span>No data.</span>}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => {
              const rowId = resolveRowId(row, idx);
              const isSelected = hasSelection && selectedSet.has(rowId);
              return (
                <tr
                  key={rowId}
                  data-row-id={rowId}
                  data-selected={isSelected || undefined}
                  onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                  className={cn(
                    'border-b border-retro-border/20 transition-colors hover:bg-retro-surface/30',
                    striped && idx % 2 === 1 && 'bg-retro-surface/15',
                    onRowClick && 'cursor-pointer',
                    isSelected && 'bg-retro-surface/40',
                  )}
                >
                  {hasSelection && (
                    <td
                      className={cn('text-retro-text w-10', padCls, stickyFirstColumn && stickyFirstBodyCls)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        aria-label={`Select row ${rowId}`}
                        checked={isSelected}
                        onChange={() => toggleOne(rowId)}
                        className={cn('h-4 w-4', focusRing)}
                      />
                    </td>
                  )}
                  {columns.map((col, colIdx) => {
                    const cellStickyCls = stickyFirstColumn && !hasSelection && colIdx === 0 ? stickyFirstBodyCls : '';
                    const cellStyle: React.CSSProperties | undefined = col.width != null
                      ? { width: typeof col.width === 'number' ? `${col.width}px` : col.width }
                      : undefined;
                    return (
                      <td
                        key={col.key}
                        style={cellStyle}
                        className={cn(
                          'text-retro-text',
                          padCls,
                          col.align && alignClass[col.align],
                          cellStickyCls,
                          col.className,
                        )}
                      >
                        {renderCellContent(col, row, idx)}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
