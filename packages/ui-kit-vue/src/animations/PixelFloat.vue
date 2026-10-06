<script setup lang="ts">
import { computed, useTemplateRef, type VNode } from 'vue';
import { animationInlineClasses, floatStyle, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * Gentle vertical sine loop, for hero badges and floating accents. It plays
 * as `trigger` says and holds still when the user prefers reduced motion.
 * Attributes fall through to the wrapping `<div>`.
 *
 * @example
 * <PixelFloat :distance="14"><span>Drifting</span></PixelFloat>
 */
export interface PixelFloatProps {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Vertical travel distance in pixels. */
  distance?: number;
  /** Iteration count: a number or `'infinite'`. */
  repeat?: AnimationRepeat;
  /** CSS `animation-timing-function`. */
  easing?: string;
  /**
   * When the animation plays: `'mount'`, `'hover'`, `'click'`, `'focus'`,
   * `'inView'`, or `true` / `false` to control it.
   */
  trigger?: AnimationTrigger;
}

const props = withDefaults(defineProps<PixelFloatProps>(), {
  duration: 2200,
  distance: 6,
  repeat: 'infinite',
  easing: 'ease-in-out',
  trigger: 'mount',
});
const emit = defineEmits<{
  /** After the final iteration. */
  complete: [];
}>();
defineSlots<{
  /** Content to float. */
  default?(): VNode[];
}>();

const element = useTemplateRef<HTMLElement>('element');
const { active, listeners, ended } = useAnimationTrigger(element, () => props.trigger, () => emit('complete'));
const style = computed(() => (active.value ? floatStyle(props) : undefined));
</script>

<template>
  <div ref="element" :class="animationInlineClasses" :style="style" v-on="listeners" @animationend="ended">
    <slot />
  </div>
</template>
