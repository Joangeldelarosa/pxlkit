<script setup lang="ts">
import { computed, useTemplateRef, type VNode } from 'vue';
import { glitchClasses, glitchStyles, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * CRT glitch in three layers: the content, sliced and shifted, under two
 * colour-split copies of it (hidden from assistive technology) that flash
 * on other slices. It plays as `trigger` says; when the user prefers
 * reduced motion only the content shows, still. Attributes fall through to
 * the wrapping `<div>`.
 *
 * @example
 * <PixelGlitch :intensity="8"><span class="text-2xl font-bold">CRITICAL ERROR</span></PixelGlitch>
 */
export interface PixelGlitchProps {
  /** Length of one full glitch loop in milliseconds. */
  duration?: number;
  /** Maximum horizontal displacement (pixels) of the layers. */
  intensity?: number;
  /**
   * When the animation plays: `'mount'`, `'hover'`, `'click'`, `'focus'`,
   * `'inView'`, or `true` / `false` to control it.
   */
  trigger?: AnimationTrigger;
}

const props = withDefaults(defineProps<PixelGlitchProps>(), {
  duration: 3000,
  intensity: 4,
  trigger: 'mount',
});
const emit = defineEmits<{
  /** After the final iteration of the content's layer. */
  complete: [];
}>();
defineSlots<{
  /** Content to glitch, rendered once per layer. */
  default?(): VNode[];
}>();

const element = useTemplateRef<HTMLElement>('element');
const { active, listeners, ended } = useAnimationTrigger(element, () => props.trigger, () => emit('complete'));
const styles = computed(() => glitchStyles(props));
</script>

<template>
  <div ref="element" :class="glitchClasses.root" v-on="listeners">
    <template v-if="active">
      <div aria-hidden="true" :class="glitchClasses.ghost" :style="styles.red"><slot /></div>
      <div aria-hidden="true" :class="glitchClasses.ghost" :style="styles.cyan"><slot /></div>
    </template>
    <div :style="active ? styles.main : undefined" @animationend="ended"><slot /></div>
  </div>
</template>
