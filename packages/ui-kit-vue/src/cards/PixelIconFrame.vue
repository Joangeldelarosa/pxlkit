<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  iconFrameClasses,
  type IconFrameAccentPosition,
  type IconFrameShape,
  type IconFrameSize,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { RenderNode, type PxlNode } from '../_internal/render-node.js';
import { useReducedMotion } from '../composables/media-query.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Decorative frame around an icon: a toned, bordered square, rounded square
 * or circle at one of five sizes, with an optional accent badge in a corner.
 * `animated` makes it pulse, unless the user prefers reduced motion. The icon
 * and the accent are hidden from assistive technology: name the frame on a
 * parent when it means something. Attributes go to the frame.
 *
 * @example
 * <PixelIconFrame tone="cyan" :accent="{ icon: () => h(Dot) }">
 *   <template #icon><TerminalIcon /></template>
 * </PixelIconFrame>
 */
export interface PixelIconFrameProps {
  /** Width and height, in px. */
  size?: IconFrameSize;
  /** Tone of the border, fill and icon. */
  tone?: ToneKey;
  /** `square` keeps the surface's corners. */
  shape?: IconFrameShape;
  /** Badge in a corner: its content (text, a VNode or a render function) and corner (top right by default). */
  accent?: { icon: PxlNode; position?: IconFrameAccentPosition };
  /** Pulses, unless the user prefers reduced motion. */
  animated?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelIconFrameProps>(), {
  size: 56,
  tone: 'neutral',
  shape: 'square',
  accent: undefined,
  animated: false,
  surface: undefined,
});
defineSlots<{
  /** The icon. */
  icon?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const reducedMotion = useReducedMotion();
const classes = computed(() =>
  iconFrameClasses(surface.value, {
    size: props.size,
    tone: props.tone,
    shape: props.shape,
    accentPosition: props.accent?.position,
    animated: props.animated,
    reducedMotion: reducedMotion.value,
  }),
);
</script>

<template>
  <div :class="classes.root">
    <span :class="classes.icon" aria-hidden="true"><slot name="icon" /></span>
    <span v-if="accent" :class="classes.accent" aria-hidden="true"><RenderNode :node="accent.icon" /></span>
  </div>
</template>
