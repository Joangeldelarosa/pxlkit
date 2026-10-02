<script setup lang="ts">
import { computed, useTemplateRef, type VNode } from 'vue';
import {
  slideInStyle,
  type AnimationFillMode,
  type AnimationRepeat,
  type AnimationTrigger,
  type SlideInFrom,
} from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * Slides its content in from one of the four edges. It plays as `trigger`
 * says and shows the content still when the user prefers reduced motion.
 * Attributes fall through to the wrapping `<div>`.
 *
 * @example
 * <PixelSlideIn from="left" :distance="20"><p>Slides in from the left</p></PixelSlideIn>
 */
export interface PixelSlideInProps {
  /** Edge to slide from. */
  from?: SlideInFrom;
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Animation delay in milliseconds. */
  delay?: number;
  /** Translate distance in pixels. */
  distance?: number;
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

const props = withDefaults(defineProps<PixelSlideInProps>(), {
  from: 'down',
  duration: 350,
  delay: 0,
  distance: 10,
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
  /** Content to slide in. */
  default?(): VNode[];
}>();

const element = useTemplateRef<HTMLElement>('element');
const { active, listeners, ended } = useAnimationTrigger(element, () => props.trigger, () => emit('complete'));
const style = computed(() => (active.value ? slideInStyle(props) : undefined));
</script>

<template>
  <div ref="element" :style="style" v-on="listeners" @animationend="ended">
    <slot />
  </div>
</template>
