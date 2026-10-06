<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  containerClasses,
  resolveContainerPadding,
  type ContainerElement,
  type ContainerPadding,
  type ContainerWidth,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelCenter from './PixelCenter.vue';

/**
 * Full-width page band: vertical rhythm around a centred, width-capped
 * column (a `PixelCenter`) that holds the content.
 */
export interface PixelContainerProps {
  /** Width cap of the inner column (`containerWidth`). */
  maxWidth?: ContainerWidth;
  /**
   * Vertical rhythm (`sectionRhythm`), or `{ x, y }`: the gutter of the inner
   * column (`pageGutter`) and the rhythm. Both default to `lg`.
   */
  padding?: ContainerPadding;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Element to render — a landmark wants an `aria-label` or `aria-labelledby`. */
  as?: ContainerElement;
}

const props = withDefaults(defineProps<PixelContainerProps>(), {
  maxWidth: 'xl',
  padding: undefined,
  surface: undefined,
  as: 'section',
});
defineSlots<{
  /** Content of the inner column. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const padding = computed(() => resolveContainerPadding(props.padding));
const classes = computed(() => containerClasses(surface.value, padding.value.y));
</script>

<template>
  <component :is="as" :class="classes">
    <PixelCenter :max-width="maxWidth" :gutter="padding.x" :surface="surface"><slot /></PixelCenter>
  </component>
</template>
