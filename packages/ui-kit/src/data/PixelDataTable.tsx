'use client';

import React, { forwardRef, useMemo } from 'react';
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type VisibilityState,
  type OnChangeFn,
  type Updater,
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
  Surface, cn,
  surfaceClasses, useEffectiveSurface,
  focusRing,
} from '../common';

export type PixelDataTableDensity = 'compact' | 'normal' | 'comfortable';

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
}

const cellPad: Record<PixelDataTableDensity, string> = {
  compact: 'px-3 py-1',
  normal: 'px-4 py-2.5',
  comfortable: 'px-4 py-4',
};

function resolveUpdater<T>(updater: Updater<T>, prev: T): T {
  return typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 8 8" className={cn('h-2 w-2', className)} shapeRendering="crispEdges" fill="currentColor">
      <rect x="3" y="2" width="2" height="1" />
      <rect x="2" y="3" width="1" height="1" />
      <rect x="5" y="3" width="1" height="1" />
      <rect x="1" y="4" width="1" height="1" />
      <rect x="6" y="4" width="1" height="1" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 8 8" className={cn('h-2 w-2', className)} shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="2" width="1" height="1" />
      <rect x="6" y="2" width="1" height="1" />
      <rect x="2" y="3" width="1" height="1" />
      <rect x="5" y="3" width="1" height="1" />
      <rect x="3" y="4" width="2" height="1" />
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
  }: PixelDataTableProps<TData, TValue>,
  ref: React.Ref<HTMLDivElement>,
) {
  const surface = useEffectiveSurface(surfaceProp);
  const s = surfaceClasses(surface);

  // Merge a selection column when row selection is enabled.
  const hasRowSelection = rowSelection !== undefined;
  const mergedColumns = useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!hasRowSelection) return columns;
    const selectionCol: ColumnDef<TData, TValue> = {
      id: '__select__',
      enableSorting: false,
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all rows"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected();
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className={cn('h-4 w-4', focusRing)}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select row ${row.id}`}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
          className={cn('h-4 w-4', focusRing)}
        />
      ),
    };
    return [selectionCol, ...columns];
  }, [columns, hasRowSelection]);

  // Adapter callbacks: TanStack uses Updater<T>; consumers want plain values.
  const sortingState: SortingState = (sorting as SortingState | undefined) ?? [];
  const filteringState: ColumnFiltersState = useMemo(() => {
    if (!filtering) return [];
    return Object.entries(filtering).map(([id, value]) => ({ id, value }));
  }, [filtering]);
  const paginationState: PaginationState = pagination ?? { pageIndex: 0, pageSize: 10 };
  const rowSelectionState: RowSelectionState = rowSelection ?? {};
  const visibilityState: VisibilityState = columnVisibility ?? {};

  const handleSorting: OnChangeFn<SortingState> = (updater) => {
    const next = resolveUpdater(updater, sortingState);
    onSortingChange?.(next.map((sv) => ({ id: sv.id, desc: sv.desc })));
  };
  const handleFilters: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next = resolveUpdater(updater, filteringState);
    const dict: Record<string, string> = {};
    for (const f of next) dict[f.id] = String(f.value ?? '');
    onFilteringChange?.(dict);
  };
  const handlePagination: OnChangeFn<PaginationState> = (updater) => {
    const next = resolveUpdater(updater, paginationState);
    onPaginationChange?.({ pageIndex: next.pageIndex, pageSize: next.pageSize });
  };
  const handleRowSelection: OnChangeFn<RowSelectionState> = (updater) => {
    const next = resolveUpdater(updater, rowSelectionState);
    onRowSelectionChange?.(next);
  };
  const handleVisibility: OnChangeFn<VisibilityState> = (updater) => {
    const next = resolveUpdater(updater, visibilityState);
    onColumnVisibilityChange?.(next);
  };

  const table = useReactTable<TData>({
    data,
    columns: mergedColumns,
    state: {
      sorting: sortingState,
      columnFilters: filteringState,
      pagination: pagination ? paginationState : undefined,
      rowSelection: rowSelectionState,
      columnVisibility: visibilityState,
    },
    getRowId: getRowId ? (row, idx) => getRowId(row, idx) : undefined,
    enableRowSelection: hasRowSelection,
    onSortingChange: onSortingChange ? handleSorting : undefined,
    onColumnFiltersChange: onFilteringChange ? handleFilters : undefined,
    onPaginationChange: onPaginationChange ? handlePagination : undefined,
    onRowSelectionChange: onRowSelectionChange ? handleRowSelection : undefined,
    onColumnVisibilityChange: onColumnVisibilityChange ? handleVisibility : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    manualPagination: false,
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const visibleColCount = mergedColumns.length;
  const skeletonRowCount = paginationState.pageSize > 0 ? Math.min(paginationState.pageSize, 5) : 5;

  return (
    <div
      ref={ref}
      className={cn(
        'overflow-x-auto',
        s.border, s.radius,
        'border-retro-border',
        className,
      )}
    >
      <table className={cn('w-full text-left text-sm', s.font)}>
        <thead
          className={cn(
            'bg-retro-surface/60',
            surface === 'pixel' ? 'border-b-2 border-retro-border' : 'border-b border-retro-border',
            stickyHeader && 'sticky top-0 z-10',
          )}
        >
          {headerGroups.map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortDir = header.column.getIsSorted();
                const label = typeof header.column.columnDef.header === 'string'
                  ? header.column.columnDef.header
                  : header.column.id;
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={
                      sortDir === 'asc' ? 'ascending'
                        : sortDir === 'desc' ? 'descending'
                          : canSort ? 'none' : undefined
                    }
                    className={cn(
                      'whitespace-nowrap text-xs font-semibold text-retro-muted',
                      cellPad[density],
                    )}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        aria-label={`Sort by ${label}`}
                        className={cn(
                          'inline-flex items-center gap-1 text-left text-retro-muted hover:text-retro-text outline-none',
                          focusRing, s.transition,
                        )}
                      >
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        <span aria-hidden className="inline-flex flex-col leading-none">
                          <ChevronUp className={cn('text-retro-muted/50', sortDir === 'asc' && 'text-retro-text')} />
                          <ChevronDown className={cn('text-retro-muted/50 -mt-0.5', sortDir === 'desc' && 'text-retro-text')} />
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
            <tr aria-hidden className="sr-only">
              <td colSpan={visibleColCount}>
                <span role="status" aria-live="polite">Loading data…</span>
              </td>
            </tr>
          )}
          {loading ? (
            Array.from({ length: skeletonRowCount }).map((_, i) => (
              <tr key={`sk-${i}`} className="border-b border-retro-border/20">
                {Array.from({ length: visibleColCount }).map((_, j) => (
                  <td key={`sk-${i}-${j}`} className={cn(cellPad[density])}>
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
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={visibleColCount} className={cn('text-center text-retro-muted', cellPad[density])}>
                {emptyState ?? <span>No data.</span>}
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
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'border-b border-retro-border/20 transition-colors',
                    onRowClick && 'cursor-pointer',
                    idx % 2 === 1 && 'bg-retro-surface/15',
                    'hover:bg-retro-surface/30',
                    isSelected && 'bg-retro-surface/40',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn('text-retro-text', cellPad[density])}
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

      {pagination && (
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
  const s = surfaceClasses(surface);
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(totalRows, (pageIndex + 1) * pageSize);
  const sizeOptions = [5, 10, 20, 50];
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs text-retro-muted',
        s.font,
        surface === 'pixel' ? 'border-t-2 border-retro-border' : 'border-t border-retro-border',
      )}
    >
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1">
          <span>Rows per page</span>
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className={cn(
              'bg-retro-surface/40 px-1 py-0.5 text-retro-text outline-none',
              s.border, s.radius, focusRing, 'border-retro-border-strong',
            )}
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
          aria-label="Previous page"
          className={cn(
            'px-2 py-1 text-retro-text outline-none disabled:opacity-50 disabled:cursor-not-allowed',
            s.border, s.radius, focusRing, 'border-retro-border-strong hover:bg-retro-surface/40',
          )}
        >
          Prev
        </button>
        <span aria-live="polite">
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next page"
          className={cn(
            'px-2 py-1 text-retro-text outline-none disabled:opacity-50 disabled:cursor-not-allowed',
            s.border, s.radius, focusRing, 'border-retro-border-strong hover:bg-retro-surface/40',
          )}
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
