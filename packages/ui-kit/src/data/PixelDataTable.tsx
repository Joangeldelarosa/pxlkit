'use client';

import React, { forwardRef, useMemo, useState } from 'react';
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type VisibilityState,
  type OnChangeFn,
  type Row,
  type Table as TanStackTable,
  type ColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table';

// Re-export the TanStack types/helpers consumers need to type their column
// definitions without taking a direct dependency on `@tanstack/react-table`.
export type {
  ColumnDef,
  Row,
  ColumnHelper,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  VisibilityState,
};
export type PixelDataTableInstance<TData> = TanStackTable<TData>;
export { createColumnHelper };
import {
  DATA_TABLE_NEXT_PAGE_LABEL,
  DATA_TABLE_PAGE_SIZE_LABEL,
  DATA_TABLE_PREVIOUS_PAGE_LABEL,
  DATA_TABLE_SELECT_COLUMN,
  TABLE_EMPTY_LABEL,
  TABLE_LOADING_LABEL,
  TABLE_SELECT_ALL_LABEL,
  TABLE_SORT_GLYPHS,
  dataTableAriaSort,
  dataTableClasses,
  dataTableColumnFilters,
  dataTableFilterRecord,
  dataTablePageNumber,
  dataTablePageRange,
  dataTablePageSizes,
  dataTablePaginationClasses,
  dataTableRowClasses,
  dataTableSkeletonRows,
  dataTableSortGlyphClasses,
  resolveDataTableUpdater,
  tableCheckboxClasses,
  tableRowActivationKey,
  tableRowSelectLabel,
  tableSortLabel,
  type PixelDataTableDensity,
} from '@pxlkit/ui-kit-core';
import { Surface, cn, useEffectiveSurface } from '../common';

export type { PixelDataTableDensity } from '@pxlkit/ui-kit-core';

export interface PixelDataTableProps<TData, TValue = unknown> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  sorting?: { id: string; desc: boolean }[];
  onSortingChange?: (next: { id: string; desc: boolean }[]) => void;
  filtering?: Record<string, string>;
  onFilteringChange?: (next: Record<string, string>) => void;
  pagination?: { pageIndex: number; pageSize: number };
  onPaginationChange?: (next: { pageIndex: number; pageSize: number }) => void;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (next: Record<string, boolean>) => void;
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (next: Record<string, boolean>) => void;
  getRowId?: (row: TData, idx: number) => string;
  density?: PixelDataTableDensity;
  stickyHeader?: boolean;
  loading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  surface?: Surface;
  className?: string;
  /** Render with surface-aware border + radius chrome. Defaults to true — data table needs visible chrome. */
  bordered?: boolean;
}

function SortGlyph({ dir, active }: { dir: 'asc' | 'desc'; active: false | 'asc' | 'desc' }) {
  return (
    <svg aria-hidden viewBox="0 0 8 8" className={dataTableSortGlyphClasses(dir, active)} shapeRendering="crispEdges" fill="currentColor">
      {TABLE_SORT_GLYPHS[dir].map(([x, y, width, height]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} />
      ))}
    </svg>
  );
}

function PixelDataTableInner<TData, TValue = unknown>(
  {
    data,
    columns,
    sorting,
    onSortingChange,
    filtering,
    onFilteringChange,
    pagination,
    onPaginationChange,
    rowSelection,
    onRowSelectionChange,
    columnVisibility,
    onColumnVisibilityChange,
    getRowId,
    density = 'normal',
    stickyHeader = false,
    loading = false,
    emptyState,
    onRowClick,
    surface: surfaceProp,
    className,
    bordered = true,
  }: PixelDataTableProps<TData, TValue>,
  ref: React.Ref<HTMLDivElement>,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const classes = dataTableClasses(surface, { density, bordered, stickyHeader });

  // Merge a selection column when row selection is enabled.
  const hasRowSelection = rowSelection !== undefined;
  const mergedColumns = useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!hasRowSelection) return columns;
    const selectionCol: ColumnDef<TData, TValue> = {
      id: DATA_TABLE_SELECT_COLUMN,
      enableSorting: false,
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label={TABLE_SELECT_ALL_LABEL}
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className={tableCheckboxClasses}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={tableRowSelectLabel(row.id)}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          className={tableCheckboxClasses}
        />
      ),
    };
    return [selectionCol, ...columns];
  }, [columns, hasRowSelection]);

  // Internal state fallbacks when consumer omits the matching on*Change.
  // Mirrors useControllableState pattern: controlled prop overrides internal.
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [internalFiltering, setInternalFiltering] = useState<ColumnFiltersState>([]);
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    pagination ?? { pageIndex: 0, pageSize: 10 },
  );
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const [internalVisibility, setInternalVisibility] = useState<VisibilityState>({});

  // Adapter callbacks: TanStack uses Updater<T>; consumers want plain values.
  const sortingState: SortingState = (sorting as SortingState | undefined) ?? internalSorting;
  const filteringState: ColumnFiltersState = useMemo(() => {
    if (!filtering) return internalFiltering;
    return dataTableColumnFilters(filtering);
  }, [filtering, internalFiltering]);
  const paginationState: PaginationState = pagination ?? internalPagination;
  const rowSelectionState: RowSelectionState = rowSelection ?? internalRowSelection;
  const visibilityState: VisibilityState = columnVisibility ?? internalVisibility;

  const handleSorting: OnChangeFn<SortingState> = (updater) => {
    const next = resolveDataTableUpdater(updater, sortingState);
    if (sorting === undefined) setInternalSorting(next);
    onSortingChange?.(next.map((sv) => ({ id: sv.id, desc: sv.desc })));
  };
  const handleFilters: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next = resolveDataTableUpdater(updater, filteringState);
    if (filtering === undefined) setInternalFiltering(next);
    onFilteringChange?.(dataTableFilterRecord(next));
  };
  const handlePagination: OnChangeFn<PaginationState> = (updater) => {
    const next = resolveDataTableUpdater(updater, paginationState);
    if (pagination === undefined) setInternalPagination(next);
    onPaginationChange?.({ pageIndex: next.pageIndex, pageSize: next.pageSize });
  };
  const handleRowSelection: OnChangeFn<RowSelectionState> = (updater) => {
    const next = resolveDataTableUpdater(updater, rowSelectionState);
    if (rowSelection === undefined) setInternalRowSelection(next);
    onRowSelectionChange?.(next);
  };
  const handleVisibility: OnChangeFn<VisibilityState> = (updater) => {
    const next = resolveDataTableUpdater(updater, visibilityState);
    if (columnVisibility === undefined) setInternalVisibility(next);
    onColumnVisibilityChange?.(next);
  };

  // The table pages, with its pagination bar, once `pagination` is bound.
  // TanStack keeps a pagination row model it was given once, and reads the
  // page from its state whenever it applies it, so both are always passed:
  // unbound, the table pages manually — not at all — and still reports its
  // resets to the first page, as it does bound.
  const paginationEnabled = pagination !== undefined;

  const table = useReactTable<TData>({
    data,
    columns: mergedColumns,
    state: {
      sorting: sortingState,
      columnFilters: filteringState,
      pagination: paginationState,
      rowSelection: rowSelectionState,
      columnVisibility: visibilityState,
    },
    getRowId: getRowId ? (row, idx) => getRowId(row, idx) : undefined,
    enableRowSelection: hasRowSelection,
    onSortingChange: handleSorting,
    onColumnFiltersChange: handleFilters,
    onPaginationChange: handlePagination,
    onRowSelectionChange: handleRowSelection,
    onColumnVisibilityChange: handleVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: !paginationEnabled,
    autoResetPageIndex: true,
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const visibleColCount = mergedColumns.length;
  const skeletonRowCount = dataTableSkeletonRows(paginationState.pageSize);

  return (
    <div
      ref={ref}
      className={cn(classes.wrapper, className)}
    >
      <table className={classes.table}>
        <thead
          className={classes.head}
        >
          {headerGroups.map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDir = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={dataTableAriaSort(sortDir, canSort)}
                    className={classes.headCell}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        aria-label={tableSortLabel(header.column.columnDef.header, header.column.id)}
                        className={classes.sortButton}
                      >
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        <span aria-hidden className="inline-flex flex-col leading-none">
                          <SortGlyph dir="asc" active={sortDir} />
                          <SortGlyph dir="desc" active={sortDir} />
                        </span>
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody aria-busy={loading || undefined}>
          {loading && (
            <tr className="sr-only">
              <td colSpan={visibleColCount}>
                <span role="status" aria-live="polite">{TABLE_LOADING_LABEL}</span>
              </td>
            </tr>
          )}
          {loading ? (
            Array.from({ length: skeletonRowCount }).map((_, i) => (
              <tr key={`sk-${i}`} className={classes.skeletonRow}>
                {Array.from({ length: visibleColCount }).map((_, j) => (
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
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={visibleColCount} className={classes.emptyCell}>
                {emptyState ?? <span>{TABLE_EMPTY_LABEL}</span>}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const isSelected = row.getIsSelected();
              return (
                <tr
                  key={row.id}
                  data-row-id={row.id}
                  data-selected={isSelected || undefined}
                  // A clickable row is reachable and activates from the keyboard
                  // too; the keys of a control inside it stay the control's.
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  onKeyDown={onRowClick ? (e) => {
                    if (e.target !== e.currentTarget || !tableRowActivationKey(e.key)) return;
                    e.preventDefault();
                    onRowClick(row.original);
                  } : undefined}
                  className={dataTableRowClasses({ index: idx, clickable: !!onRowClick, selected: isSelected })}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={classes.cell}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {paginationEnabled && (
        <PixelDataTablePagination
          surface={surface}
          pageIndex={paginationState.pageIndex}
          pageSize={paginationState.pageSize}
          totalRows={table.getFilteredRowModel().rows.length}
          pageCount={table.getPageCount()}
          canPrev={table.getCanPreviousPage()}
          canNext={table.getCanNextPage()}
          onPrev={() => table.previousPage()}
          onNext={() => table.nextPage()}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      )}
    </div>
  );
}

interface PaginationBarProps {
  surface: Surface;
  pageIndex: number;
  pageSize: number;
  totalRows: number;
  pageCount: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPageSizeChange: (size: number) => void;
}

function PixelDataTablePagination({
  surface,
  pageIndex,
  pageSize,
  totalRows,
  pageCount,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onPageSizeChange,
}: PaginationBarProps) {
  const classes = dataTablePaginationClasses(surface);
  const { start, end } = dataTablePageRange(pageIndex, pageSize, totalRows);
  // The current size is offered too when it is not a standard one, so the
  // select shows it (a select shows its first option for a value it lacks).
  const sizeOptions = dataTablePageSizes(pageSize);
  return (
    <div
      className={classes.bar}
    >
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1">
          <span>{DATA_TABLE_PAGE_SIZE_LABEL}</span>
          <select
            aria-label={DATA_TABLE_PAGE_SIZE_LABEL}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={classes.pageSizeSelect}
          >
            {sizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <span>
          Showing {start}-{end} of {totalRows}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label={DATA_TABLE_PREVIOUS_PAGE_LABEL}
          className={classes.pageButton}
        >
          Prev
        </button>
        <span aria-live="polite">
          Page {dataTablePageNumber(pageIndex, pageCount)} of {pageCount}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          aria-label={DATA_TABLE_NEXT_PAGE_LABEL}
          className={classes.pageButton}
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * `PixelDataTable` — TanStack-powered surface-aware data table with sorting,
 * filtering, pagination, row selection, column visibility, density, sticky
 * header, loading skeletons, and empty state. All state is controllable.
 *
 * Polymorphic-ref note: rendered root is a `<div>` wrapping `<table>`; ref
 * targets the wrapper div for measurement / scroll control.
 */
export const PixelDataTable = forwardRef(PixelDataTableInner) as <TData, TValue = unknown>(
  props: PixelDataTableProps<TData, TValue> & { ref?: React.Ref<HTMLDivElement> },
) => ReturnType<typeof PixelDataTableInner>;

(PixelDataTable as unknown as { displayName: string }).displayName = 'PixelDataTable';
