<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { carouselItemClasses, carouselSlideLabel } from '@pxlkit/ui-kit-core';
import { useCarouselPosition } from './_internal/carousel-context.js';

/**
 * One slide of a `PixelCarousel`: a group (`aria-roledescription="slide"`)
 * named "Slide N of M" by its position. Attributes go to the slide.
 */
defineSlots<{
  /** The slide's content. */
  default?(): VNode[];
}>();

const position = useCarouselPosition();
const label = computed(() => (position ? carouselSlideLabel(position.index, position.total) : undefined));
</script>

<template>
  <div role="group" aria-roledescription="slide" :aria-label="label" :class="carouselItemClasses"><slot /></div>
</template>
