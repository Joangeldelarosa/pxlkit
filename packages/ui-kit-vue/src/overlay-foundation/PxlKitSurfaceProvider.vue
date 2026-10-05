<script setup lang="ts">
import { provide, toRef } from 'vue';
import type { Surface } from '@pxlkit/ui-kit-core';
import { PXLKIT_SURFACE } from '../composables/surface.js';

/**
 * Wrap a subtree to change the default `surface` of every nested Pxlkit
 * component without setting the prop on each one individually. Renders no
 * element of its own.
 *
 * @example
 * <PxlKitSurfaceProvider surface="linear">
 *   <PixelButton>Looks modern</PixelButton>
 * </PxlKitSurfaceProvider>
 */
const props = withDefaults(
  defineProps<{
    /** Surface of every nested component that does not set its own. */
    surface?: Surface;
  }>(),
  { surface: 'pixel' },
);
defineSlots<{
  /** The part of the app the surface applies to. */
  default?(): unknown;
}>();

provide(PXLKIT_SURFACE, toRef(props, 'surface'));
</script>

<template>
  <slot />
</template>
