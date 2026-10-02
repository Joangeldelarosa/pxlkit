<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  centerClasses,
  type CenterAlign,
  type ContainerWidth,
  type PageGutter,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/** Horizontally centred column: width cap, page gutter and text alignment. */
export interface PixelCenterProps {
  /** Width cap (`containerWidth`). */
  maxWidth?: ContainerWidth;
  /** Horizontal padding (`pageGutter`). */
  gutter?: PageGutter;
  /** Text alignment of the centred content. */
  align?: CenterAlign;
  /** @deprecated Use `align`. */
  text?: CenterAlign;
  /** `inline-block` instead of `block`. */
  inline?: boolean;
  /** Element to render. */
  as?: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Surface border and radius. */
  bordered?: boolean;
}

const props = withDefaults(defineProps<PixelCenterProps>(), {
  maxWidth: '5xl',
  gutter: 'lg',
  align: undefined,
  text: undefined,
  inline: false,
  as: 'div',
  surface: undefined,
  bordered: false,
});
defineSlots<{ default?(): VNode[] }>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  centerClasses(surface.value, {
    maxWidth: props.maxWidth,
    gutter: props.gutter,
    align: props.align ?? props.text,
    inline: props.inline,
    bordered: props.bordered,
  }),
);
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
