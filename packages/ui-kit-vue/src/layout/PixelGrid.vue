<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  gridClasses,
  gridTemplateColumns,
  type GridAlign,
  type GridColumnCount,
  type GridJustify,
  type GridResponsiveColumns,
  type GridRowCount,
  type StackGapKey,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * CSS grid: a column count (or one per breakpoint), or as many columns as
 * fit (`auto-fit` / `auto-fill`); row count, gap tokens and item alignment.
 */
export interface PixelGridProps {
  /** Column count, or a count per breakpoint (`{ base: 1, md: 3 }`); ignored with `autoFit` / `autoFill`. */
  cols?: GridColumnCount | GridResponsiveColumns;
  /** Row count. */
  rows?: GridRowCount;
  /** Gap token (`stackGap`) between rows and columns. */
  gap?: StackGapKey;
  /** Gap between columns; with `rowGap`, it replaces `gap`. */
  colGap?: StackGapKey;
  /** Gap between rows; with `colGap`, it replaces `gap`. */
  rowGap?: StackGapKey;
  /** As many columns as fit, empty tracks collapsed. */
  autoFit?: boolean;
  /** As many columns as fit, empty tracks kept. */
  autoFill?: boolean;
  /** Narrowest column with `autoFit` / `autoFill` (any CSS length). */
  minColWidth?: string;
  /** Block-axis alignment of the items. */
  align?: GridAlign;
  /** Inline-axis alignment of the items. */
  justify?: GridJustify;
  /** Element to render. */
  as?: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelGridProps>(), {
  cols: undefined,
  rows: undefined,
  gap: 4,
  colGap: undefined,
  rowGap: undefined,
  autoFit: false,
  autoFill: false,
  minColWidth: '16rem',
  align: undefined,
  justify: undefined,
  as: 'div',
  surface: undefined,
});
defineSlots<{
  /** The items. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  gridClasses(surface.value, {
    cols: props.cols,
    rows: props.rows,
    gap: props.gap,
    colGap: props.colGap,
    rowGap: props.rowGap,
    autoFit: props.autoFit,
    autoFill: props.autoFill,
    align: props.align,
    justify: props.justify,
  }),
);
const style = computed(() => {
  const templateColumns = gridTemplateColumns({
    autoFit: props.autoFit,
    autoFill: props.autoFill,
    minColWidth: props.minColWidth,
  });
  return templateColumns ? { gridTemplateColumns: templateColumns } : undefined;
});
</script>

<template>
  <component :is="as" :class="classes" :style="style"><slot /></component>
</template>
