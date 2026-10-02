<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  clusterClasses,
  type StackAlign,
  type StackGapKey,
  type StackJustify,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/** Wrapping row of items (tags, chips, actions) with a gap token and alignment. */
export interface PixelClusterProps {
  /** Gap token (`stackGap`). */
  gap?: StackGapKey;
  /** Cross-axis alignment. */
  align?: StackAlign;
  /** Main-axis distribution. */
  justify?: StackJustify;
  /** Element to render. */
  as?: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelClusterProps>(), {
  gap: 4,
  align: 'center',
  justify: undefined,
  as: 'div',
  surface: undefined,
});
defineSlots<{ default?(): VNode[] }>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  clusterClasses(surface.value, { gap: props.gap, align: props.align, justify: props.justify }),
);
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
