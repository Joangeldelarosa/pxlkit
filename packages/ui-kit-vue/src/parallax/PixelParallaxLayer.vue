<script setup lang="ts">
import { useTemplateRef, watch, type VNode } from 'vue';
import { followScroll, parallaxLayerClasses, type ParallaxAxis } from '@pxlkit/ui-kit-core';
import { useReducedMotion } from '../composables/media-query.js';

/**
 * Layer that moves with the scroll, faster or slower than the page: on every
 * animation frame it is translated by its distance from the viewport's
 * centre times `speed` — 0 holds it in place, 0.5 gives a far background,
 * a negative speed a foreground that floats the other way. When the user
 * prefers reduced motion it holds still.
 */
export interface PixelParallaxLayerProps {
  /** Multiplier of the scroll: 0 holds the layer in place, 1 moves it at scroll speed, a negative one reverses it. */
  speed?: number;
  /** Axis the layer moves along. */
  axis?: ParallaxAxis;
}

const props = withDefaults(defineProps<PixelParallaxLayerProps>(), { speed: 0.5, axis: 'y' });
defineSlots<{ default?(): VNode[] }>();

const layer = useTemplateRef<HTMLElement>('layer');
const reducedMotion = useReducedMotion();

watch(
  [layer, () => props.speed, () => props.axis, reducedMotion],
  ([element, speed, axis, reduced], _previous, onCleanup) => {
    if (!element || reduced) return;
    onCleanup(followScroll(element, { speed, axis }));
  },
  { flush: 'post' },
);
</script>

<template>
  <div ref="layer" :class="parallaxLayerClasses"><slot /></div>
</template>
