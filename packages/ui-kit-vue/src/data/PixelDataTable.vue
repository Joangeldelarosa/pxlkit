<script setup lang="ts" generic="TData, TValue = unknown">
import { computed, h, type VNode } from 'vue';
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/vue-table';
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
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * A TanStack Table (`@tanstack/vue-table`) rendered as a native table:
 * sortable headers (`aria-sort`), filtering, pagination with a page-size
 * select, a checkbox column for row selection, column visibility, density,
 * sticky header, skeleton rows while loading and an empty state. Every state
 * binds with `v-model:*` or stays inside the table; a selection column
 * appears once `row-selection` is bound, the pagination bar once
 * `pagination` is. Columns are TanStack `ColumnDef`s (`createColumnHelper`
 * is re-exported), their `header` and `cell` text or render functions.
 *
 * @example
 * <PixelDataTable :data="rows" :columns="columns" v-model:sorting="sorting" v-model:row-selection="selection" />
 */
export interface PixelDataTableProps<TData, TValue = unknown> {
  /** Row data. */
  data: TData[];
  /** TanStack column definitions. */
  columns: ColumnDef<TData, TValue>[];
  /** Sort state (`v-model:sorting`); leave unset to let the table sort. */
  sorting?: { id: string; desc: boolean }[];
  /** Column filters, column id → value (`v-model:filtering`). */
  filtering?: Record<string, string>;
  /** Page (`v-model:pagination`); the pagination bar shows once it is set. */
  pagination?: { pageIndex: number; pageSize: number };
  /** Selected row ids → `true` (`v-model:row-selection`); the selection column shows once it is set. */
  rowSelection?: Record<string, boolean>;
  /** Column id → shown (`v-model:column-visibility`). */
  columnVisibility?: Record<string, boolean>;
  /** A stable id per row; the index by default. */
  getRowId?: (row: TData, index: number) => string;
  /** Cell padding scale. */
  density?: PixelDataTableDensity;
  /** Sticks the header to the top of the scroll container. */
  stickyHeader?: boolean;
  /** Shows skeleton rows instead of the data. */
  loading?: boolean;
  /**
   * Row click handler (`@row-click`), with the row's data; also run by Enter
   * or Space on a focused row. Declared as a prop because its presence changes
   * the rows: clickable rows show a pointer and take focus.
   */
  onRowClick?: (row: TData) => void;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Surface border and radius around the table. */
  bordered?: boolean;
}

const props = withDefaults(defineProps<PixelDataTableProps<TData, TValue>>(), {
  sorting: undefined,
  filtering: undefined,
  pagination: undefined,
  rowSelection: undefined,
  columnVisibility: undefined,
  getRowId: undefined,
  density: 'normal',
  stickyHeader: false,
  loading: false,
  onRowClick: undefined,
  surface: undefined,
  bordered: true,
});

const emit = defineEmits<{
  /** The new sort, after a click on a sortable header. */
  'update:sorting': [sorting: { id: string; desc: boolean }[]];
  /** The new column filters. */
  'update:filtering': [filtering: Record<string, string>];
  /** The new page, after a page button, a page-size change or a reset to the first page. */
  'update:pagination': [pagination: { pageIndex: number; pageSize: number }];
  /** The new row selection, after a checkbox changes. */
  'update:rowSelection': [rowSelection: Record<string, boolean>];
  /** The new column visibility. */
  'update:columnVisibility': [columnVisibility: Record<string, boolean>];
}>();

defineSlots<{
  /** Shown in a full-width cell when there are no rows; "No data." by default. */
  'empty-state'?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  dataTableClasses(surface.value, { density: props.density, bordered: props.bordered, stickyHeader: props.stickyHeader }),
);
const paginationClasses = computed(() => dataTablePaginationClasses(surface.value));

const [sorting, setSorting] = useControllableState<SortingState>({
  value: () => props.sorting,
  defaultValue: () => [],
  onChange: (next) => emit('update:sorting', next.map(({ id, desc }) => ({ id, desc }))),
});
const [filters, setFilters] = useControllableState<ColumnFiltersState>({
  value: () => (props.filtering ? dataTableColumnFilters(props.filtering) : undefined),
  defaultValue: () => [],
  onChange: (next) => emit('update:filtering', dataTableFilterRecord(next)),
});
const [pagination, setPagination] = useControllableState<PaginationState>({
  value: () => props.pagination,
  defaultValue: () => props.pagination ?? { pageIndex: 0, pageSize: 10 },
  onChange: ({ pageIndex, pageSize }) => emit('update:pagination', { pageIndex, pageSize }),
});
const [rowSelection, setRowSelection] = useControllableState<RowSelectionState>({
  value: () => props.rowSelection,
  defaultValue: () => ({}),
  onChange: (next) => emit('update:rowSelection', next),
});
const [columnVisibility, setColumnVisibility] = useControllableState<VisibilityState>({
  value: () => props.columnVisibility,
  defaultValue: () => ({}),
  onChange: (next) => emit('update:columnVisibility', next),
});

const hasRowSelection = computed(() => props.rowSelection !== undefined);
const paginationEnabled = computed(() => props.pagination !== undefined);

// Created once, so the checkboxes keep their elements (and focus) across renders.
const selectionColumn: ColumnDef<TData, TValue> = {
  id: DATA_TABLE_SELECT_COLUMN,
  enableSorting: false,
  header: ({ table }) =>
    h('input', {
      type: 'checkbox',
      'aria-label': TABLE_SELECT_ALL_LABEL,
      checked: table.getIsAllPageRowsSelected(),
      // A property only, as React sets it: never an attribute in server markup.
      '.indeterminate': table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
      class: tableCheckboxClasses,
      onChange: table.getToggleAllPageRowsSelectedHandler(),
    }),
  cell: ({ row }) =>
    h('input', {
      type: 'checkbox',
      'aria-label': tableRowSelectLabel(row.id),
      checked: row.getIsSelected(),
      disabled: !row.getCanSelect(),
      class: tableCheckboxClasses,
      onChange: row.getToggleSelectedHandler(),
    }),
};
const columns = computed(() => (hasRowSelection.value ? [selectionColumn, ...props.columns] : props.columns));
const paginationRowModel = getPaginationRowModel<TData>();

const table = useVueTable<TData>({
  get data() {
    return props.data;
  },
  get columns() {
    return columns.value;
  },
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return filters.value;
    },
    get pagination() {
      return paginationEnabled.value ? pagination.value : undefined;
    },
    get rowSelection() {
      return rowSelection.value;
    },
    get columnVisibility() {
      return columnVisibility.value;
    },
  },
  get getRowId() {
    const { getRowId } = props;
    return getRowId ? (row: TData, index: number) => getRowId(row, index) : undefined;
  },
  get enableRowSelection() {
    return hasRowSelection.value;
  },
  onSortingChange: (updater) => setSorting(resolveDataTableUpdater(updater, sorting.value)),
  onColumnFiltersChange: (updater) => setFilters(resolveDataTableUpdater(updater, filters.value)),
  onPaginationChange: (updater) => setPagination(resolveDataTableUpdater(updater, pagination.value)),
  onRowSelectionChange: (updater) => setRowSelection(resolveDataTableUpdater(updater, rowSelection.value)),
  onColumnVisibilityChange: (updater) => setColumnVisibility(resolveDataTableUpdater(updater, columnVisibility.value)),
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  get getPaginationRowModel() {
    return paginationEnabled.value ? paginationRowModel : undefined;
  },
  manualPagination: false,
});

const skeletonRows = computed(() => dataTableSkeletonRows(pagination.value.pageSize));
const pageRange = computed(() =>
  dataTablePageRange(pagination.value.pageIndex, pagination.value.pageSize, table.getFilteredRowModel().rows.length),
);

// A clickable row is reachable and activates from the keyboard too; the
// keys of a control inside it stay the control's.
function activateRow(event: KeyboardEvent, row: TData) {
  if (!props.onRowClick || event.target !== event.currentTarget || !tableRowActivationKey(event.key)) return;
  event.preventDefault();
  props.onRowClick(row);
}

function changePageSize(event: Event) {
  table.setPageSize(Number((event.target as HTMLSelectElement).value));
}
</script>

<template>
  <div :class="classes.wrapper">
    <table :class="classes.table">
      <thead :class="classes.head">
        <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            scope="col"
            :aria-sort="dataTableAriaSort(header.column.getIsSorted(), header.column.getCanSort())"
            :class="classes.headCell"
          >
            <template v-if="!header.isPlaceholder">
              <button
                v-if="header.column.getCanSort()"
                type="button"
                :aria-label="tableSortLabel(header.column.columnDef.header, header.column.id)"
                :class="classes.sortButton"
                @click="header.column.getToggleSortingHandler()?.($event)"
              >
                <span><FlexRender :render="header.column.columnDef.header" :props="header.getContext()" /></span>
                <span aria-hidden="true" class="inline-flex flex-col leading-none">
                  <svg
                    v-for="dir in (['asc', 'desc'] as const)"
                    :key="dir"
                    aria-hidden="true"
                    viewBox="0 0 8 8"
                    :class="dataTableSortGlyphClasses(dir, header.column.getIsSorted())"
                    shape-rendering="crispEdges"
                    fill="currentColor"
                  >
                    <rect
                      v-for="[x, y, width, height] in TABLE_SORT_GLYPHS[dir]"
                      :key="`${x}-${y}`"
                      :x="x"
                      :y="y"
                      :width="width"
                      :height="height"
                    />
                  </svg>
                </span>
              </button>
              <FlexRender v-else :render="header.column.columnDef.header" :props="header.getContext()" />
            </template>
          </th>
        </tr>
      </thead>
      <tbody :aria-busy="loading || undefined">
        <tr v-if="loading" class="sr-only">
          <td :colspan="columns.length">
            <span role="status" aria-live="polite">{{ TABLE_LOADING_LABEL }}</span>
          </td>
        </tr>
        <template v-if="loading">
          <tr v-for="row in skeletonRows" :key="`sk-${row}`" :class="classes.skeletonRow">
            <td v-for="cell in columns.length" :key="`sk-${row}-${cell}`" :class="classes.skeletonCell">
              <div data-skeleton="true" aria-hidden="true" :class="classes.skeleton" />
            </td>
          </tr>
        </template>
        <tr v-else-if="table.getRowModel().rows.length === 0">
          <td :colspan="columns.length" :class="classes.emptyCell">
            <slot name="empty-state"><span>{{ TABLE_EMPTY_LABEL }}</span></slot>
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="(row, index) in table.getRowModel().rows"
            :key="row.id"
            :data-row-id="row.id"
            :data-selected="row.getIsSelected() || undefined"
            :class="dataTableRowClasses({ index, clickable: onRowClick !== undefined, selected: row.getIsSelected() })"
            :tabindex="onRowClick ? 0 : undefined"
            @click="onRowClick?.(row.original)"
            @keydown="activateRow($event, row.original)"
          >
            <td v-for="cell in row.getVisibleCells()" :key="cell.id" :class="classes.cell">
              <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <div v-if="paginationEnabled" :class="paginationClasses.bar">
      <div class="flex items-center gap-2">
        <label class="flex items-center gap-1">
          <span>{{ DATA_TABLE_PAGE_SIZE_LABEL }}</span>
          <select
            :aria-label="DATA_TABLE_PAGE_SIZE_LABEL"
            :value="pagination.pageSize"
            :class="paginationClasses.pageSizeSelect"
            @change="changePageSize"
          >
            <option v-for="size in dataTablePageSizes(pagination.pageSize)" :key="size" :value="size">{{ size }}</option>
          </select>
        </label>
        <span>Showing {{ pageRange.start }}-{{ pageRange.end }} of {{ table.getFilteredRowModel().rows.length }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="!table.getCanPreviousPage()"
          :aria-label="DATA_TABLE_PREVIOUS_PAGE_LABEL"
          :class="paginationClasses.pageButton"
          @click="table.previousPage()"
        >
          Prev
        </button>
        <span aria-live="polite">Page {{ dataTablePageNumber(pagination.pageIndex, table.getPageCount()) }} of {{ table.getPageCount() }}</span>
        <button
          type="button"
          :disabled="!table.getCanNextPage()"
          :aria-label="DATA_TABLE_NEXT_PAGE_LABEL"
          :class="paginationClasses.pageButton"
          @click="table.nextPage()"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
