import React from 'react';
import {
  TABLE_EMPTY_LABEL,
  TABLE_LOADING_LABEL,
  TABLE_SELECT_ALL_LABEL,
  TABLE_SELECT_LABEL,
  TABLE_SKELETON_ROWS,
  TABLE_SORT_GLYPHS,
  nextTableSort,
  sortTableRows,
  tableAriaSort,
  tableCellClasses,
  tableCheckboxClasses,
  tableClasses,
  tableColumnWidth,
  tableHeadCellClasses,
  tableRowActivationKey,
  tableRowClasses,
  tableRowId,
  tableRowSelectLabel,
  tableSelectionSummary,
  tableSortGlyphClasses,
  tableSortLabel,
  toggleTableRow,
  type PixelTableAlign,
  type PixelTableDensity,
  type PixelTableSelection,
  type PixelTableSortDir,
  type PixelTableSortState,
} from '@pxlkit/ui-kit-core';
import { Surface, useEffectiveSurface } from '../common';

/* ─────────────────────────────────────────────────────────────────────────
   PixelTable — data table with striped rows + hover highlight.

   Upgraded (Ola 4a) additively: optional column.sortable/align/render/width,
   controlled sort with header-button + aria-sort, single/multi selection
   with checkbox column, sticky header, sticky first column, skeleton
   loading rows, empty state, row click handler, density scale. Legacy API
   (columns:{key,header,className?} + data:Record<string,ReactNode>) keeps
   rendering exactly as before.
   ───────────────────────────────────────────────────────────────────────── */

export type {
  PixelTableAlign,
  PixelTableDensity,
  PixelTableSelection,
  PixelTableSortDir,
  PixelTableSortState,
} from '@pxlkit/ui-kit-core';

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
  /** Called when a body row is clicked, or on Enter / Space on it. Renders it focusable, with `cursor-pointer`. */
  onRowClick?: (row: Row, idx: number) => void;
  /** Cell padding scale. Defaults to `'normal'`. */
  density?: PixelTableDensity;
  /** Render with surface-aware border + radius chrome. Defaults to true — tables need visible chrome. */
  bordered?: boolean;
}

function PixelTableSortIcons({ dir }: { dir: PixelTableSortDir | null }) {
  return (
    <span aria-hidden className="inline-flex flex-col leading-none ml-1">
      {(['asc', 'desc'] as const).map((glyph) => (
        <svg key={glyph} viewBox="0 0 8 8" shapeRendering="crispEdges" fill="currentColor" className={tableSortGlyphClasses(glyph, dir)}>
          {TABLE_SORT_GLYPHS[glyph].map(([x, y, width, height]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} />
          ))}
        </svg>
      ))}
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
  bordered = true,
}: PixelTableProps<Row>) {
  const surface = useEffectiveSurface(surfaceProp);
  const hasSelection = selection !== undefined;
  const options = {
    density,
    bordered,
    stickyHeader: !!stickyHeader,
    stickyFirstColumn: !!stickyFirstColumn,
    selectable: hasSelection,
  };
  const classes = tableClasses(surface, options);
  // Internal selection fallback for uncontrolled mode.
  const [internalSelected, setInternalSelected] = React.useState<string[]>([]);
  const effectiveSelectedIds = selectedIds ?? internalSelected;
  const selectedSet = React.useMemo(() => new Set(effectiveSelectedIds), [effectiveSelectedIds]);
  // Internal sort fallback. Active iff a sortable column exists. Headers always
  // render a button when col.sortable is true (no more onSortChange gate).
  const [internalSort, setInternalSort] = React.useState<PixelTableSortState | undefined>(undefined);
  const effectiveSort = sort ?? internalSort;
  const commitSelection = (next: string[]) => {
    if (selectedIds === undefined) setInternalSelected(next);
    onSelectionChange?.(next);
  };

  const resolveRowId = React.useCallback(
    (row: Row, idx: number): string => tableRowId(row, idx, getRowId),
    [getRowId],
  );

  const totalColCount = columns.length + (hasSelection ? 1 : 0);

  // Apply sort to rows when a sortable column is active (see sortTableRows).
  // Original order preserved when no sort is active.
  const sortedData = React.useMemo(
    () => sortTableRows(data, columns, effectiveSort),
    [data, columns, effectiveSort],
  );

  const allRowIds = React.useMemo(
    () => sortedData.map((row, idx) => resolveRowId(row, idx)),
    [sortedData, resolveRowId],
  );
  const summary = tableSelectionSummary(allRowIds, selectedSet);
  const allSelected = hasSelection && summary.all;
  const someSelected = hasSelection && summary.some;

  const headerCheckboxRef = React.useRef<HTMLInputElement | null>(null);
  React.useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleAll = () => {
    if (!hasSelection || selection !== 'multi') return;
    commitSelection(allSelected ? [] : allRowIds);
  };

  const toggleOne = (id: string) => {
    if (!hasSelection) return;
    commitSelection(toggleTableRow(selection, selectedSet, id));
  };

  const handleSortClick = (col: PixelTableColumn<Row>) => {
    if (!col.sortable) return;
    const next = nextTableSort(effectiveSort, col.key);
    if (sort === undefined) setInternalSort(next);
    onSortChange?.(next);
  };

  const renderCellContent = (col: PixelTableColumn<Row>, row: Row, idx: number): React.ReactNode => {
    if (col.render) return col.render(row, idx);
    const r = row as unknown as Record<string, React.ReactNode>;
    return r?.[col.key] ?? '';
  };

  return (
    <div className={classes.wrapper}>
      <table className={classes.table}>
        <thead
          className={classes.head}
        >
          <tr className={classes.headRow}>
            {hasSelection && (
              <th
                scope="col"
                className={classes.selectHead}
              >
                {selection === 'multi' ? (
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    aria-label={TABLE_SELECT_ALL_LABEL}
                    checked={allSelected}
                    onChange={toggleAll}
                    className={tableCheckboxClasses}
                  />
                ) : (
                  <span className="sr-only">{TABLE_SELECT_LABEL}</span>
                )}
              </th>
            )}
            {columns.map((col, colIdx) => {
              const isSorted = effectiveSort?.key === col.key;
              const width = tableColumnWidth(col.width);
              const headerStyle: React.CSSProperties | undefined = width ? { width } : undefined;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={tableAriaSort(col, effectiveSort)}
                  style={headerStyle}
                  className={tableHeadCellClasses(col, colIdx, options)}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSortClick(col)}
                      aria-label={tableSortLabel(col.header, col.key)}
                      className={classes.sortButton}
                    >
                      <span>{col.header}</span>
                      <PixelTableSortIcons dir={isSorted ? effectiveSort!.dir : null} />
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
            <tr className="sr-only">
              <td colSpan={totalColCount}>
                <span role="status" aria-live="polite">{TABLE_LOADING_LABEL}</span>
              </td>
            </tr>
          )}
          {loading ? (
            Array.from({ length: TABLE_SKELETON_ROWS }).map((_, i) => (
              <tr key={`sk-${i}`} className={classes.skeletonRow}>
                {Array.from({ length: totalColCount }).map((_, j) => (
                  <td key={`sk-${i}-${j}`} className={classes.skeletonCell}>
                    <div
                      data-skeleton
                      aria-hidden
                      className={classes.skeleton}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={totalColCount} className={classes.emptyCell}>
                {emptyState ?? <span>{TABLE_EMPTY_LABEL}</span>}
              </td>
            </tr>
          ) : (
            sortedData.map((row, idx) => {
              const rowId = resolveRowId(row, idx);
              const isSelected = hasSelection && selectedSet.has(rowId);
              return (
                <tr
                  key={rowId}
                  data-row-id={rowId}
                  data-selected={isSelected || undefined}
                  // A clickable row is reachable and activates from the keyboard
                  // too; the keys of a control inside it stay the control's.
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                  onKeyDown={onRowClick ? (e) => {
                    if (e.target !== e.currentTarget || !tableRowActivationKey(e.key)) return;
                    e.preventDefault();
                    onRowClick(row, idx);
                  } : undefined}
                  className={tableRowClasses({ index: idx, striped, clickable: !!onRowClick, selected: isSelected })}
                >
                  {hasSelection && (
                    <td
                      className={classes.selectCell}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        aria-label={tableRowSelectLabel(rowId)}
                        checked={isSelected}
                        onChange={() => toggleOne(rowId)}
                        className={tableCheckboxClasses}
                      />
                    </td>
                  )}
                  {columns.map((col, colIdx) => {
                    const width = tableColumnWidth(col.width);
                    const cellStyle: React.CSSProperties | undefined = width ? { width } : undefined;
                    return (
                      <td
                        key={col.key}
                        style={cellStyle}
                        className={tableCellClasses(col, colIdx, options)}
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
