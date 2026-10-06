<script setup lang="ts">
import { computed, useTemplateRef, type VNode } from 'vue';
import { animationInlineClasses, bounceStyle, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * Vertical bounce with damped follow-through, for any inline content. It
 * plays as `trigger` says and holds still when the user prefers reduced
 * motion. Attributes fall through to the wrapping `<div>`.
 *
 * @example
 * <PixelBounce trigger="hover" :repeat="1"><span>Hover me</span></PixelBounce>
 */
export interface PixelBounceProps {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Iteration count: a number or `'infinite'`. */
  repeat?: AnimationRepeat;
  /** Peak bounce height in pixels. */
  height?: number;
  /** CSS `animation-timing-function`. */
  easing?: string;
  /**
   * When the animation plays: `'mount'`, `'hover'`, `'click'`, `'focus'`,
   * `'inView'`, or `true` / `false` to control it.
   */
  trigger?: AnimationTrigger;
}

const props = withDefaults(defineProps<PixelBounceProps>(), {
  duration: 800,
  repeat: 'infinite',
  height: 8,
  easing: 'ease',
  trigger: 'mount',
});
const emit = defineEmits<{
  /** After the final iteration. */
  complete: [];
}>();
defineSlots<{
  /** Content to bounce. */
  default?(): VNode[];
}>();

const element = useTemplateRef<HTMLElement>('element');
const { active, listeners, ended } = useAnimationTrigger(element, () => props.trigger, () => emit('complete'));
const style = computed(() => (active.value ? bounceStyle(props) : undefined));
</script>

<template>
  <div ref="element" :class="animationInlineClasses" :style="style" v-on="listeners" @animationend="ended">
    <slot />
  </div>
</template>
