<script setup lang="ts">
import { computed, useTemplateRef, type VNode } from 'vue';
import { fadeInStyle, type AnimationFillMode, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * Fades its content in, from transparent to opaque. It plays as `trigger`
 * says and shows the content still when the user prefers reduced motion.
 * Attributes fall through to the wrapping `<div>`.
 *
 * @example
 * <PixelFadeIn :duration="600" :delay="200" easing="ease-out"><p>Delayed fade-in</p></PixelFadeIn>
 */
export interface PixelFadeInProps {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Animation delay in milliseconds. */
  delay?: number;
  /** Iteration count: a number or `'infinite'`. */
  repeat?: AnimationRepeat;
  /** CSS `animation-timing-function`. */
  easing?: string;
  /** CSS `animation-fill-mode`. */
  fillMode?: AnimationFillMode;
  /**
   * When the animation plays: `'mount'`, `'hover'`, `'click'`, `'focus'`,
   * `'inView'`, or `true` / `false` to control it.
   */
  trigger?: AnimationTrigger;
}

const props = withDefaults(defineProps<PixelFadeInProps>(), {
  duration: 400,
  delay: 0,
  repeat: 1,
  easing: 'ease',
  fillMode: 'both',
  trigger: 'mount',
});
const emit = defineEmits<{
  /** After the final iteration. */
  complete: [];
}>();
defineSlots<{
  /** Content to fade in. */
  default?(): VNode[];
}>();

const element = useTemplateRef<HTMLElement>('element');
const { active, listeners, ended } = useAnimationTrigger(element, () => props.trigger, () => emit('complete'));
const style = computed(() => (active.value ? fadeInStyle(props) : undefined));
</script>

<template>
  <div ref="element" :style="style" v-on="listeners" @animationend="ended">
    <slot />
  </div>
</template>
