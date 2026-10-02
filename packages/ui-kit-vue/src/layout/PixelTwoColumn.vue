<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  twoColumnClasses,
  twoColumnSideClasses,
  type GridAlign,
  type StackGapKey,
  type Surface,
  type TwoColumnBreakpoint,
  type TwoColumnRatio,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Two columns side by side at a fixed ratio, stacked below a breakpoint.
 * The `left` and `right` slots fill them; `reverse` swaps them on screen
 * while keeping the reading order.
 */
export interface PixelTwoColumnProps {
  /** Width of the left column against the right one. */
  ratio?: TwoColumnRatio;
  /** Gap token (`stackGap`). */
  gap?: StackGapKey;
  /** Show the right column first (CSS `order`; the DOM order stays). */
  reverse?: boolean;
  /** Breakpoint below which the columns stack. */
  stackBelow?: TwoColumnBreakpoint;
  /** Block-axis alignment of the columns. */
  align?: GridAlign;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Element to render. */
  as?: string;
  /** Surface border and radius. */
  bordered?: boolean;
}

const props = withDefaults(defineProps<PixelTwoColumnProps>(), {
  ratio: '50/50',
  gap: 6,
  reverse: false,
  stackBelow: 'md',
  align: undefined,
  surface: undefined,
  as: 'div',
  bordered: false,
});
defineSlots<{
  /** Content of the left column. */
  left?(): VNode[];
  /** Content of the right column. */
  right?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  twoColumnClasses(surface.value, {
    ratio: props.ratio,
    gap: props.gap,
    stackBelow: props.stackBelow,
    align: props.align,
    bordered: props.bordered,
  }),
);
const sides = computed(() => twoColumnSideClasses(props.reverse));
</script>

<template>
  <component :is="as" :class="classes">
    <div :class="sides.left"><slot name="left" /></div>
    <div :class="sides.right"><slot name="right" /></div>
  </component>
</template>
