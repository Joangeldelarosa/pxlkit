<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { BENTO_AUTO_ROWS, bentoClasses, type BentoColumns, type StackGapKey } from '@pxlkit/ui-kit-core';

/**
 * Responsive bento grid for `PixelBentoCell`s: cells stack on phones and the
 * full column count applies from `lg`; rows are at least 160px tall.
 */
export interface PixelBentoProps {
  /** Column count from `lg` up. */
  columns?: BentoColumns;
  /** Gap token (`stackGap`). */
  gap?: StackGapKey;
}

const props = withDefaults(defineProps<PixelBentoProps>(), { columns: 3, gap: 4 });
defineSlots<{ default?(): VNode[] }>();

const classes = computed(() => bentoClasses(props.columns, props.gap));
</script>

<template>
  <div :data-columns="columns" :class="classes" :style="{ gridAutoRows: BENTO_AUTO_ROWS }"><slot /></div>
</template>
