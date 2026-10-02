<script setup lang="ts">
import { computed, useTemplateRef, type VNode } from 'vue';
import { flickerStyle, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * Broken-neon-sign opacity flicker, for retro signage and emphasis. It plays
 * as `trigger` says and holds still when the user prefers reduced motion.
 * Attributes fall through to the wrapping `<div>`.
 *
 * @example
 * <PixelFlicker :duration="900"><span>NEON</span></PixelFlicker>
 */
export interface PixelFlickerProps {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Iteration count: a number or `'infinite'`. */
  repeat?: AnimationRepeat;
  /**
   * When the animation plays: `'mount'`, `'hover'`, `'click'`, `'focus'`,
   * `'inView'`, or `true` / `false` to control it.
   */
  trigger?: AnimationTrigger;
}

const props = withDefaults(defineProps<PixelFlickerProps>(), {
  duration: 2200,
  repeat: 'infinite',
  trigger: 'mount',
});
const emit = defineEmits<{
  /** After the final iteration. */
  complete: [];
}>();
defineSlots<{
  /** Content to flicker. */
  default?(): VNode[];
}>();

const element = useTemplateRef<HTMLElement>('element');
const { active, listeners, ended } = useAnimationTrigger(element, () => props.trigger, () => emit('complete'));
const style = computed(() => (active.value ? flickerStyle(props) : undefined));
</script>

<template>
  <div ref="element" :style="style" v-on="listeners" @animationend="ended">
    <slot />
  </div>
</template>
