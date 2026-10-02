<script setup lang="ts">
import { computed, useTemplateRef, type VNode } from 'vue';
import { animationInlineClasses, shakeStyle, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * Quick horizontal shake, for validation errors and attention cues. It plays
 * as `trigger` says and holds still when the user prefers reduced motion.
 * Attributes fall through to the wrapping `<div>`.
 *
 * @example
 * <PixelShake :trigger="invalid" @complete="invalid = false"><span>Wrong password</span></PixelShake>
 */
export interface PixelShakeProps {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Horizontal travel distance in pixels. */
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

const props = withDefaults(defineProps<PixelShakeProps>(), {
  duration: 450,
  distance: 2,
  repeat: 1,
  easing: 'linear',
  trigger: 'mount',
});
const emit = defineEmits<{
  /** After the final iteration. */
  complete: [];
}>();
defineSlots<{
  /** Content to shake. */
  default?(): VNode[];
}>();

const element = useTemplateRef<HTMLElement>('element');
const { active, listeners, ended } = useAnimationTrigger(element, () => props.trigger, () => emit('complete'));
const style = computed(() => (active.value ? shakeStyle(props) : undefined));
</script>

<template>
  <div ref="element" :class="animationInlineClasses" :style="style" v-on="listeners" @animationend="ended">
    <slot />
  </div>
</template>
