<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { textLinkClasses, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Tone-coloured underlined link for prose, callouts and CTAs: an `<a>` with
 * an `href`, a `<button type="button">` without one. Other attributes and
 * listeners (`target`, `rel`, `@click`) go to that element.
 */
export interface PixelTextLinkProps {
  /** Link target; without one the link is a button. */
  href?: string;
  /** Tone tint. */
  tone?: Tone;
  /** Visual surface override. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelTextLinkProps>(), {
  href: undefined,
  tone: 'cyan',
  surface: undefined,
});
defineSlots<{
  /** Link content. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => textLinkClasses(surface.value, props.tone));
</script>

<template>
  <a v-if="href" :href="href" :class="classes"><slot /></a>
  <button v-else type="button" :class="classes"><slot /></button>
</template>
