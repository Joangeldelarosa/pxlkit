<script setup lang="ts">
import { computed, useTemplateRef, type VNode } from 'vue';
import { zoomInStyle, type AnimationFillMode, type AnimationRepeat, type AnimationTrigger } from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * Scales its content up from `startScale` to full size while it fades in. It
 * plays as `trigger` says and shows the content still when the user prefers
 * reduced motion. Attributes fall through to the wrapping `<div>`.
 *
 * @example
 * <PixelZoomIn :start-scale="0.6" :duration="500"><div>Bigger zoom</div></PixelZoomIn>
 */
export interface PixelZoomInProps {
  /** Animation duration in milliseconds. */
  duration?: number;
  /** Animation delay in milliseconds. */
  delay?: number;
  /** Starting `scale()` factor. */
  startScale?: number;
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

const props = withDefaults(defineProps<PixelZoomInProps>(), {
  duration: 320,
  delay: 0,
  startScale: 0.92,
  repeat: 1,
  easing: 'cubic-bezier(.2,.9,.2,1)',
  fillMode: 'both',
  trigger: 'mount',
});
const emit = defineEmits<{
  /** After the final iteration. */
  complete: [];
}>();
defineSlots<{
  /** Content to zoom in. */
  default?(): VNode[];
}>();

const element = useTemplateRef<HTMLElement>('element');
const { active, listeners, ended } = useAnimationTrigger(element, () => props.trigger, () => emit('complete'));
const style = computed(() => (active.value ? zoomInStyle(props) : undefined));
</script>

<template>
  <div ref="element" :style="style" v-on="listeners" @animationend="ended">
    <slot />
  </div>
</template>
