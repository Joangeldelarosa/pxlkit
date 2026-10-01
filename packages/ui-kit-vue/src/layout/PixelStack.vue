<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  cn,
  stackAlignClasses,
  stackDirectionClasses,
  stackGap,
  stackJustifyClasses,
  surfaceClasses,
  type StackAlign,
  type StackDirection,
  type StackGapKey,
  type StackJustify,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/** Flexbox stack: direction, gap token, alignment, distribution and wrapping. */
export interface PixelStackProps {
  /** Main axis. */
  direction?: StackDirection;
  /** Gap token (`stackGap`). */
  gap?: StackGapKey;
  /** Cross-axis alignment. */
  align?: StackAlign;
  /** Main-axis distribution. */
  justify?: StackJustify;
  /** Wrap onto multiple lines. */
  wrap?: boolean;
  /** `inline-flex` instead of `flex`. */
  inline?: boolean;
  /** Element to render. */
  as?: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelStackProps>(), {
  direction: 'col',
  gap: 4,
  align: undefined,
  justify: undefined,
  wrap: false,
  inline: false,
  as: 'div',
  surface: undefined,
});
defineSlots<{ default?(): VNode[] }>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  cn(
    props.inline ? 'inline-flex' : 'flex',
    stackDirectionClasses[props.direction],
    stackGap[props.gap],
    props.align && stackAlignClasses[props.align],
    props.justify && stackJustifyClasses[props.justify],
    props.wrap && 'flex-wrap',
    surfaceClasses(surface.value).transition,
  ),
);
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
