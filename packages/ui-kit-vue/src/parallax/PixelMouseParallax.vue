<script setup lang="ts">
import { useTemplateRef, watch, type VNode } from 'vue';
import { createMouseParallaxMotion, mouseParallaxClasses, type MouseParallaxMotion } from '@pxlkit/ui-kit-core';
import { useReducedMotion } from '../composables/media-query.js';

/**
 * Layer that follows the mouse — or flees it with `invert` — easing towards
 * the cursor's position across the nearest `PixelParallaxGroup` (any
 * element with a `relative` class) or the page, by up to `strength` px.
 * When the user prefers reduced motion it holds still.
 */
export interface PixelMouseParallaxProps {
  /** Farthest the layer travels from its place on each axis, in px. */
  strength?: number;
  /** Move away from the cursor instead of towards it. */
  invert?: boolean;
}

const props = withDefaults(defineProps<PixelMouseParallaxProps>(), { strength: 20, invert: false });
defineSlots<{ default?(): VNode[] }>();

const layer = useTemplateRef<HTMLElement>('layer');
const reducedMotion = useReducedMotion();
// Where the layer is and where it heads outlive a change of props.
let motion: MouseParallaxMotion | undefined;

watch(
  [layer, () => props.strength, () => props.invert, reducedMotion],
  ([element, strength, invert, reduced], _previous, onCleanup) => {
    if (!element || reduced) return;
    motion ??= createMouseParallaxMotion(element);
    onCleanup(motion.follow({ strength, invert }));
  },
  { flush: 'post' },
);
</script>

<template>
  <div ref="layer" :class="mouseParallaxClasses"><slot /></div>
</template>
