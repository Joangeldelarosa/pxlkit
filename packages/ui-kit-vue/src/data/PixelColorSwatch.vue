<script setup lang="ts">
import { computed } from 'vue';
import { colorSwatchClasses, colorSwatchFill, type Surface } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Design-token preview: a square filled from a CSS custom property — so it
 * follows the active theme — beside the token name and the variable.
 */
export interface PixelColorSwatchProps {
  /** Display name of the token (e.g. "Cyan 500"). */
  name: string;
  /** CSS variable to preview (e.g. "--color-retro-cyan"). */
  cssVar: string;
  /** Visual surface override. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelColorSwatchProps>(), { surface: undefined });

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => colorSwatchClasses(surface.value));
</script>

<template>
  <div :class="classes.root">
    <div :class="classes.sample" :style="{ backgroundColor: colorSwatchFill(cssVar) }" />
    <div>
      <p :class="classes.name">{{ name }}</p>
      <p :class="classes.variable">{{ cssVar }}</p>
    </div>
  </div>
</template>
