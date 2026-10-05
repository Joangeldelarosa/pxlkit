<script setup lang="ts">
import { computed, onMounted, useAttrs, warn, type VNode } from 'vue';
import {
  boxClasses,
  boxLandmarkWarning,
  type BoxElement,
  type BoxPadding,
  type BoxRadius,
  type Surface,
  type Tone,
  type Variant,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Surface-aware container: padding, radius, a tone fill (`solid`, `soft`),
 * an optional border and shadow. Rendered as a landmark (`section`, `nav`,
 * `aside`, `main`) it needs an `aria-label`, `aria-labelledby` or `title`;
 * without one it warns in development.
 */
export interface PixelBoxProps {
  /** Tone of the fill and border. */
  tone?: Tone;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** `solid` and `soft` fill; `outline` and `ghost` stay transparent. */
  variant?: Variant;
  /** Padding scale. */
  padding?: BoxPadding;
  /** Fixed radius; the surface's large radius when unset. */
  radius?: BoxRadius;
  /** Draw the tone border; on for `outline`, off otherwise, when unset. */
  border?: boolean;
  /** Surface drop shadow. */
  shadow?: boolean;
  /** Element to render. */
  as?: BoxElement;
}

const props = withDefaults(defineProps<PixelBoxProps>(), {
  tone: 'neutral',
  surface: undefined,
  variant: 'solid',
  padding: 'md',
  radius: undefined,
  border: undefined,
  shadow: false,
  as: 'div',
});
defineSlots<{
  /** Box content. */
  default?(): VNode[];
}>();

const attrs = useAttrs();
const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  boxClasses(surface.value, {
    tone: props.tone,
    variant: props.variant,
    padding: props.padding,
    radius: props.radius,
    border: props.border,
    shadow: props.shadow,
  }),
);

onMounted(() => {
  const warning = boxLandmarkWarning(props.as, {
    label: attrs['aria-label'],
    labelledBy: attrs['aria-labelledby'],
    title: attrs.title,
  });
  if (warning) warn(warning);
});
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
