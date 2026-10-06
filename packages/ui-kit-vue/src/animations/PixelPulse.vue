<script setup lang="ts">
import { computed, useTemplateRef, type VNode } from 'vue';
import { pulseStyle, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * Gently scales and dims its content in a recurring pulse, to draw
 * attention. It plays as `trigger` says and holds still when the user
 * prefers reduced motion. Attributes fall through to the wrapping `<div>`.
 *
 * @example
 * <PixelPulse :duration="1000"><span>Quick Pulse</span></PixelPulse>
 */
export interface PixelPulseProps {
  /** Animation duration in milliseconds. */
  duration?: number;
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

const props = withDefaults(defineProps<PixelPulseProps>(), {
  duration: 2000,
  repeat: 'infinite',
  easing: 'ease-in-out',
  trigger: 'mount',
});
const emit = defineEmits<{
  /** After the final iteration. */
  complete: [];
}>();
defineSlots<{
  /** Content to pulse. */
  default?(): VNode[];
}>();

const element = useTemplateRef<HTMLElement>('element');
const { active, listeners, ended } = useAnimationTrigger(element, () => props.trigger, () => emit('complete'));
const style = computed(() => (active.value ? pulseStyle(props) : undefined));
</script>

<template>
  <div ref="element" :style="style" v-on="listeners" @animationend="ended">
    <slot />
  </div>
</template>
