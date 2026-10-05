<script setup lang="ts">
import { computed, useTemplateRef, type VNode } from 'vue';
import {
  glitchClasses,
  glitchCopiesStyle,
  glitchMainClasses,
  glitchStyles,
  type AnimationTrigger,
  type GlitchElement,
} from '@pxlkit/ui-kit-core';
import { useAnimationTrigger } from './_internal/animation-trigger.js';

/**
 * CRT glitch in three layers: the content, sliced and shifted, under two
 * colour-split copies of it (hidden from assistive technology) that flash
 * on other slices. It plays as `trigger` says; when the user prefers
 * reduced motion only the content shows, still. Attributes fall through to
 * the wrapper.
 *
 * @example
 * <PixelGlitch :intensity="8"><span class="text-2xl font-bold">CRITICAL ERROR</span></PixelGlitch>
 * <h2><PixelGlitch as="span" label="SIGNAL LOST" /></h2>
 */
export interface PixelGlitchProps {
  /**
   * Text to glitch, in place of the default slot: it is in the document
   * once — the stylesheet draws its colour copies — so a heading's text
   * reads once to crawlers, copying and text extraction.
   */
  label?: string;
  /** Length of one full glitch loop in milliseconds. */
  duration?: number;
  /** Maximum horizontal displacement (pixels) of the layers. */
  intensity?: number;
  /**
   * When the animation plays: `'mount'`, `'hover'`, `'click'`, `'focus'`,
   * `'inView'`, or `true` / `false` to control it.
   */
  trigger?: AnimationTrigger;
  /**
   * Element of the wrapper and its layers. `'span'` puts the glitch inside
   * phrasing content, such as a heading: wrap the heading around it, as the
   * layers repeat whatever they hold.
   */
  as?: GlitchElement;
}

const props = withDefaults(defineProps<PixelGlitchProps>(), {
  duration: 3000,
  intensity: 4,
  trigger: 'mount',
  as: 'div',
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
// A label is in the document once, in the content's layer: the stylesheet
// draws its copies from data-text while the glitch plays.
const copiesStyle = computed(() => glitchCopiesStyle(props));
</script>

<template>
  <component
    :is="as"
    v-if="label !== undefined"
    ref="element"
    :data-text="label"
    :class="[glitchClasses.root, active && glitchClasses.copies]"
    :style="active ? copiesStyle : undefined"
    v-on="listeners"
  >
    <component :is="as" :class="glitchMainClasses(as)" :style="active ? styles.main : undefined" @animationend="ended">{{ label }}</component>
  </component>
  <component :is="as" v-else ref="element" :class="glitchClasses.root" v-on="listeners">
    <template v-if="active">
      <component :is="as" aria-hidden="true" :class="glitchClasses.ghost" :style="styles.red"><slot /></component>
      <component :is="as" aria-hidden="true" :class="glitchClasses.ghost" :style="styles.cyan"><slot /></component>
    </template>
    <component :is="as" :class="glitchMainClasses(as)" :style="active ? styles.main : undefined" @animationend="ended"><slot /></component>
  </component>
</template>
