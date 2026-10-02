<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { drawerFooterClasses, type Surface } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/** Footer bar of a `PixelDrawer` for its actions, set off by a surface-aware divider. */
const props = defineProps<{
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}>();
defineSlots<{ default?(): VNode[] }>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => drawerFooterClasses(surface.value));
</script>

<template>
  <div :class="classes"><slot /></div>
</template>
