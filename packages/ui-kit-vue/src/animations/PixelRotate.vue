<script setup lang="ts">
import { computed, useTemplateRef, type VNode } from 'vue';
import {
  animationInlineClasses,
  rotateStyle,
  type AnimationDirection,
  type AnimationRepeat,
  type AnimationTrigger,
} from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * Full 360° rotation loop in the direction asked for. It plays as `trigger`
 * says and holds still when the user prefers reduced motion. Attributes
 * fall through to the wrapping `<div>`.
 *
 * @example
 * <PixelRotate direction="reverse" :duration="2400"><span>Reverse</span></PixelRotate>
 */
export interface PixelRotateProps {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Iteration count: a number or `'infinite'`. */
  repeat?: AnimationRepeat;
  /** CSS `animation-direction`. */
  direction?: AnimationDirection;
  /** CSS `animation-timing-function`. */
  easing?: string;
  /**
   * When the animation plays: `'mount'`, `'hover'`, `'click'`, `'focus'`,
   * `'inView'`, or `true` / `false` to control it.
   */
  trigger?: AnimationTrigger;
}

const props = withDefaults(defineProps<PixelRotateProps>(), {
  duration: 1800,
  repeat: 'infinite',
  direction: 'normal',
  easing: 'linear',
  trigger: 'mount',
});
const emit = defineEmits<{
  /** After the final iteration. */
  complete: [];
}>();
defineSlots<{
  /** Content to rotate. */
  default?(): VNode[];
}>();

const element = useTemplateRef<HTMLElement>('element');
const { active, listeners, ended } = useAnimationTrigger(element, () => props.trigger, () => emit('complete'));
const style = computed(() => (active.value ? rotateStyle(props) : undefined));
</script>

<template>
  <div ref="element" :class="animationInlineClasses" :style="style" v-on="listeners" @animationend="ended">
    <slot />
  </div>
</template>
