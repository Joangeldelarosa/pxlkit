<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  ribbonClasses,
  ribbonTilt,
  ribbonTransform,
  type RibbonOffset,
  type RibbonPosition,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Decorative label pinned over the edge of a relatively positioned container
 * (a card): an opaque tone fill on top of the content that never takes the
 * pointer. The corner positions lean 12° outwards unless `tilt` says
 * otherwise. Pair its message with the card's heading: the ribbon itself is
 * plain text.
 *
 * @example
 * <div class="relative">
 *   <PixelRibbon position="corner-tr" tone="red">Hot</PixelRibbon>
 * </div>
 */
export interface PixelRibbonProps {
  /** Where the ribbon sits on its container. */
  position?: RibbonPosition;
  /** Tone of the opaque fill. */
  tone?: ToneKey;
  /** How far a top ribbon rises above the container's edge. */
  offset?: RibbonOffset;
  /** Tilt in degrees; the corners lean outwards by 12° when unset. */
  tilt?: number;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelRibbonProps>(), {
  position: 'top-center',
  tone: 'gold',
  offset: 'md',
  tilt: undefined,
  surface: undefined,
});
defineSlots<{
  /** The ribbon's text. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() =>
  ribbonClasses(surface.value, { position: props.position, tone: props.tone, offset: props.offset, tilt: props.tilt }),
);
const transform = computed(() => ribbonTransform(ribbonTilt(props.position, props.tilt)));
</script>

<template>
  <div :class="classes" :style="transform ? { transform } : undefined"><slot /></div>
</template>
