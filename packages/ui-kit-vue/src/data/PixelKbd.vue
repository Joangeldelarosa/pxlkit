<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { kbdClasses, type Surface } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/** Keyboard key (`<kbd>`) drawn as a keycap, framed and given depth per surface. */
export interface PixelKbdProps {
  /** Visual surface override. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelKbdProps>(), { surface: undefined });
defineSlots<{
  /** Key label (`⌘`, `K`, `Esc`). */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => kbdClasses(surface.value));
</script>

<template>
  <kbd :class="classes"><slot /></kbd>
</template>
