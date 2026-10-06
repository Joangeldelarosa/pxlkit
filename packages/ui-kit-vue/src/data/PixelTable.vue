<script setup lang="ts" generic="Row = Record<string, unknown>">
import { computed, type Directive, type VNode, type VNodeChild } from 'vue';
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
  type PixelTableSortState,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { RenderNode, type PxlNode } from '../_internal/render-node.js';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';

/** A column of a `PixelTable`. */
export interface PixelTableColumn<Row = Record<string, unknown>> {
  /** Stable column id; also the lookup key into a row when `render` is absent. */
  key: string;
  /** Header cell content. */
  header: PxlNode;
  /** Extra classes on the column's header and body cells. */
  className?: string;
  /** The header becomes a sort button and the header cell gets `aria-sort`. */
  sortable?: boolean;
  /** Text alignment of the column's cells. */
  align?: PixelTableAlign;
  /** Width in pixels, or any CSS length. */
  width?: number | string;
  /** Cell content (text, VNodes); overrides the `row[key]` lookup. */
  render?: (row: Row, index: number) => VNodeChild;
}

/**
 * A native table: striped rows, sortable headers (`aria-sort`), single or
 * multiple row selection through a checkbox column, sticky header and first
 * column, skeleton rows while loading and an empty state. Bind the sort with
 * `v-model:sort` and the selection with `v-model:selected-ids`, or leave
 * them to the table.
 *
 * @example
 * <PixelTable :columns="columns" :data="rows" selection="multi" v-model:selected-ids="selected" />
 */
export interface PixelTableProps<Row = Record<string, unknown>> {
  /** Column definitions. */
  columns: PixelTableColumn<Row>[];
  /** Row data. */
  data: Row[];
  /** Tints every other row. */
  striped?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Sort state (`v-model:sort`); leave unset to let the table sort. */
  sort?: PixelTableSortState;
  /** Adds a leading checkbox column, for one row or several. */
  selection?: PixelTableSelection;
  /** Ids of the selected rows (`v-model:selected-ids`); leave unset to let the table keep them. */
  selectedIds?: string[];
  /** A stable id per row; falls back to `row.id`, then to the index. */
  getRowId?: (row: Row, index: number) => string;
  /** Sticks the header row to the top of the scroll container. */
  stickyHeader?: boolean;
  /** Sticks the first column to the left of the scroll container. */
  stickyFirstColumn?: boolean;
  /** Shows skeleton rows instead of the data. */
  loading?: boolean;
  /**
   * Row click handler (`@row-click`), also run by Enter or Space on a focused
   * row. Declared as a prop because its presence changes the rows: clickable
   * rows show a pointer and take focus.
   */
  onRowClick?: (row: Row, index: number) => void;
  /** Cell padding scale. */
  density?: PixelTableDensity;
  /** Surface border and radius around the table. */
  bordered?: boolean;
}

const props = withDefaults(defineProps<PixelTableProps<Row>>(), {
  striped: true,
  surface: undefined,
  sort: undefined,
  selection: undefined,
  selectedIds: undefined,
  getRowId: undefined,
  stickyHeader: false,
  stickyFirstColumn: false,
  loading: false,
  onRowClick: undefined,
  density: 'normal',
  bordered: true,
});

const emit = defineEmits<{
  /** The new sort, after a click on a sortable header. */
  'update:sort': [sort: PixelTableSortState];
  /** The new selected row ids, after each change. */
  'update:selectedIds': [ids: string[]];
}>();

defineSlots<{
  /** Shown in a full-width cell when `data` is empty; "No data." by default. */
  'empty-state'?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const [effectiveSort, setSort] = useControllableState<PixelTableSortState | undefined>({
  value: () => props.sort,
  defaultValue: () => undefined,
  onChange: (next) => {
    if (next) emit('update:sort', next);
  },
});
const [selectedIds, setSelectedIds] = useControllableState<string[]>({
  value: () => props.selectedIds,
  defaultValue: () => [],
  onChange: (next) => emit('update:selectedIds', next),
});

const options = computed(() => ({
  density: props.density,
  bordered: props.bordered,
  stickyHeader: props.stickyHeader,
  stickyFirstColumn: props.stickyFirstColumn,
  selectable: props.selection !== undefined,
}));
const classes = computed(() => tableClasses(surface.value, options.value));
const columnCount = computed(() => props.columns.length + (options.value.selectable ? 1 : 0));
const rows = computed(() => sortTableRows(props.data, props.columns, effectiveSort.value));
const rowIds = computed(() => rows.value.map((row, index) => tableRowId(row, index, props.getRowId)));
const selected = computed(() => new Set(selectedIds.value));
const summary = computed(() => tableSelectionSummary(rowIds.value, selected.value));

function toggleAll() {
  if (props.selection !== 'multi') return;
  setSelectedIds(summary.value.all ? [] : rowIds.value);
}

function toggleRow(id: string) {
  if (props.selection) setSelectedIds(toggleTableRow(props.selection, selected.value, id));
}

function sortBy(column: PixelTableColumn<Row>) {
  if (column.sortable) setSort(nextTableSort(effectiveSort.value, column.key));
}

// A clickable row is reachable and activates from the keyboard too; the
// keys of a control inside it stay the control's.
function activateRow(event: KeyboardEvent, row: Row, index: number) {
  if (!props.onRowClick || event.target !== event.currentTarget || !tableRowActivationKey(event.key)) return;
  event.preventDefault();
  props.onRowClick(row, index);
}

function cellContent(column: PixelTableColumn<Row>, row: Row, index: number): VNodeChild {
  if (column.render) return column.render(row, index);
  return ((row as Record<string, unknown>)?.[column.key] ?? '') as VNodeChild;
}

// The header checkbox's `indeterminate` is a property, never an attribute
// (server markup included), set when it changes — as React's effect does.
const vIndeterminate: Directive<HTMLInputElement, boolean> = {
  mounted: (el, { value }) => {
    el.indeterminate = value;
  },
  updated: (el, { value, oldValue }) => {
    if (value !== oldValue) el.indeterminate = value;
  },
};

function widthStyle(column: PixelTableColumn<Row>) {
  const width = tableColumnWidth(column.width);
  return width ? { width } : undefined;
}
</script>

<template>
  <div :class="classes.wrapper">
    <table :class="classes.table">
      <thead :class="classes.head">
        <tr :class="classes.headRow">
          <th v-if="selection" scope="col" :class="classes.selectHead">
            <input
              v-if="selection === 'multi'"
              type="checkbox"
              :aria-label="TABLE_SELECT_ALL_LABEL"
              :checked="summary.all"
              v-indeterminate="summary.some"
              :class="tableCheckboxClasses"
              @change="toggleAll"
            />
            <span v-else class="sr-only">{{ TABLE_SELECT_LABEL }}</span>
          </th>
          <th
            v-for="(column, columnIndex) in columns"
            :key="column.key"
            scope="col"
            :aria-sort="tableAriaSort(column, effectiveSort)"
            :style="widthStyle(column)"
            :class="tableHeadCellClasses(column, columnIndex, options)"
          >
            <button
              v-if="column.sortable"
              type="button"
              :aria-label="tableSortLabel(column.header, column.key)"
              :class="classes.sortButton"
              @click="sortBy(column)"
            >
              <span><RenderNode :node="column.header" /></span>
              <span aria-hidden="true" class="inline-flex flex-col leading-none ml-1">
                <svg
                  v-for="dir in (['asc', 'desc'] as const)"
                  :key="dir"
                  viewBox="0 0 8 8"
                  shape-rendering="crispEdges"
                  fill="currentColor"
                  :class="tableSortGlyphClasses(dir, effectiveSort?.key === column.key ? effectiveSort.dir : null)"
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
            <RenderNode v-else :node="column.header" />
          </th>
        </tr>
      </thead>
      <tbody :aria-busy="loading || undefined">
        <tr v-if="loading" class="sr-only">
          <td :colspan="columnCount">
            <span role="status" aria-live="polite">{{ TABLE_LOADING_LABEL }}</span>
          </td>
        </tr>
        <template v-if="loading">
          <tr v-for="row in TABLE_SKELETON_ROWS" :key="`sk-${row}`" :class="classes.skeletonRow">
            <td v-for="cell in columnCount" :key="`sk-${row}-${cell}`" :class="classes.skeletonCell">
              <div data-skeleton="true" aria-hidden="true" :class="classes.skeleton" />
            </td>
          </tr>
        </template>
        <tr v-else-if="rows.length === 0">
          <td :colspan="columnCount" :class="classes.emptyCell">
            <slot name="empty-state"><span>{{ TABLE_EMPTY_LABEL }}</span></slot>
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="(row, index) in rows"
            :key="rowIds[index]"
            :data-row-id="rowIds[index]"
            :data-selected="(selection !== undefined && selected.has(rowIds[index]!)) || undefined"
            :class="
              tableRowClasses({
                index,
                striped,
                clickable: onRowClick !== undefined,
                selected: selection !== undefined && selected.has(rowIds[index]!),
              })
            "
            :tabindex="onRowClick ? 0 : undefined"
            @click="onRowClick?.(row, index)"
            @keydown="activateRow($event, row as Row, index)"
          >
            <td v-if="selection" :class="classes.selectCell" @click.stop>
              <input
                type="checkbox"
                :aria-label="tableRowSelectLabel(rowIds[index]!)"
                :checked="selected.has(rowIds[index]!)"
                :class="tableCheckboxClasses"
                @change="toggleRow(rowIds[index]!)"
              />
            </td>
            <td
              v-for="(column, columnIndex) in columns"
              :key="column.key"
              :style="widthStyle(column)"
              :class="tableCellClasses(column, columnIndex, options)"
            >
              <RenderNode :node="() => cellContent(column, row as Row, index)" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
