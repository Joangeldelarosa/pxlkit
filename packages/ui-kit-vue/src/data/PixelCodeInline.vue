<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { codeInlineClasses, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Inline `<code>` tinted in a tone and framed per surface, for commands,
 * identifiers and short snippets in prose.
 */
export interface PixelCodeInlineProps {
  /** Tone tint. */
  tone?: Tone;
  /** Visual surface override. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelCodeInlineProps>(), {
  tone: 'cyan',
  surface: undefined,
});
defineSlots<{
  /** The code. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => codeInlineClasses(surface.value, props.tone));
</script>

<template>
  <code :class="classes"><slot /></code>
</template>
