<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { drawerHeaderClasses, type Surface } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/** Header bar of a `PixelDrawer`, set off from the body by a surface-aware divider. */
const props = defineProps<{
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}>();
defineSlots<{ default?(): VNode[] }>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => drawerHeaderClasses(surface.value));
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
