<script setup lang="ts">
import { computed, useAttrs, type VNode } from 'vue';
import {
  statGroupClasses,
  statGroupRole,
  type StackGapKey,
  type StatGroupLayout,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Frames stat tiles (`PixelStatCard`) together: a row divided by rules in the
 * tone, or a grid of 1 to 6 columns that folds on phones. Name it with
 * `aria-label` or `aria-labelledby` to make it a `role="group"`; other
 * attributes go to it too.
 *
 * @example
 * <PixelStatGroup layout="grid" :columns="4" :gap="3" aria-label="Key metrics">
 *   <PixelStatCard label="Users" value="1,284" />
 *   <PixelStatCard label="Revenue" value="$12.4k" />
 * </PixelStatGroup>
 */
export interface PixelStatGroupProps {
  /** A divided row, or a grid. */
  layout?: StatGroupLayout;
  /** Grid columns, 1 to 6. */
  columns?: number;
  /** Gap between grid cells (`stackGap`); flush cells when unset. */
  gap?: StackGapKey;
  /** Tone of the frame and the row's dividers. */
  tone?: ToneKey;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Surface border, radius and background. */
  bordered?: boolean;
}

const props = withDefaults(defineProps<PixelStatGroupProps>(), {
  layout: 'row',
  columns: 3,
  gap: undefined,
  tone: 'neutral',
  surface: undefined,
  bordered: true,
});
defineSlots<{
  /** The stat tiles. */
  default?(): VNode[];
}>();

const attrs = useAttrs();
const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  statGroupClasses(surface.value, {
    layout: props.layout,
    columns: props.columns,
    gap: props.gap,
    tone: props.tone,
    bordered: props.bordered,
  }),
);
// Attributes are not reactive: whether the group is named is read while rendering.
const role = () => statGroupRole(Boolean(attrs['aria-label'] || attrs['aria-labelledby']));
</script>

<template>
  <div :role="role()" :class="classes"><slot /></div>
</template>
