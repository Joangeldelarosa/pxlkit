<script setup lang="ts">
import { computed } from 'vue';
import { SKELETON_DEFAULT_HEIGHT, SKELETON_DEFAULT_LABEL, skeletonClasses, type Surface } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Pulsing loading placeholder (`role="status"`) that reserves the space of
 * the content it stands for. Classes, styles and other attributes fall
 * through to the block; a `style` wins over `width` / `height`.
 *
 * @example
 * <PixelSkeleton width="10rem" aria-label="Loading user profile" />
 */
export interface PixelSkeletonProps {
  /** CSS width (e.g. `"100%"`, `"12rem"`). */
  width?: string;
  /** CSS height. */
  height?: string;
  /** A circle on the linear surface, a 2px chamfer on the pixel one, instead of the surface radius. */
  rounded?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Accessible label (`aria-label` works too). */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<PixelSkeletonProps>(), {
  width: undefined,
  height: SKELETON_DEFAULT_HEIGHT,
  rounded: false,
  surface: undefined,
  ariaLabel: SKELETON_DEFAULT_LABEL,
});

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => skeletonClasses(surface.value, { rounded: props.rounded }));
</script>

<template>
  <div role="status" :aria-label="ariaLabel" :class="classes" :style="{ width, height }" />
</template>
