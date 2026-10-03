<script setup lang="ts">
import type { VNode } from 'vue';
import { parallaxGroupClasses, type ParallaxGroupElement } from '@pxlkit/ui-kit-core';

/**
 * Viewport for parallax layers: it positions and clips the
 * `PixelParallaxLayer` and `PixelMouseParallax` layers inside it, which a
 * mouse parallax measures the cursor across.
 */
export interface PixelParallaxGroupProps {
  /** Element to render. */
  as?: ParallaxGroupElement;
}

withDefaults(defineProps<PixelParallaxGroupProps>(), { as: 'div' });
defineSlots<{ default?(): VNode[] }>();
</script>

<template>
  <component :is="as" :class="parallaxGroupClasses"><slot /></component>
</template>
