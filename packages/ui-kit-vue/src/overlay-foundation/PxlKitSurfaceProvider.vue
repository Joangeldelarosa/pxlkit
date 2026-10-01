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
const props = withDefaults(defineProps<{ surface?: Surface }>(), { surface: 'pixel' });
defineSlots<{ default?(): unknown }>();

provide(PXLKIT_SURFACE, toRef(props, 'surface'));
</script>

<template>
  <slot />
</template>
