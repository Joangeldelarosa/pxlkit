<script setup lang="ts">
import { computed } from 'vue';
import {
  SPINNER_DEFAULT_LABEL,
  spinnerAnimation,
  spinnerClasses,
  type SpinnerSize,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useReducedMotion } from '../composables/media-query.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Compact loading indicator: a square blade turning in eight steps on the
 * pixel surface, a smoothly spinning ring on the linear one — frozen when the
 * user prefers reduced motion. It is a `role="status"` region named by
 * `label` (also visually hidden text), or pure decoration with `decorative`.
 * Other attributes fall through to the root `<span>`.
 *
 * @example
 * <PixelSpinner size="lg" tone="cyan" label="Loading results" />
 */
export interface PixelSpinnerProps {
  /** Box size. */
  size?: SpinnerSize;
  /** Accessible name. */
  label?: string;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Colour. */
  tone?: ToneKey;
  /**
   * Pure decoration (`aria-hidden`, no role, no label), for a parent that
   * already announces its busy state (a button with `aria-busy="true"`). A
   * standalone spinner needs `aria-busy="true"` on the container that loads.
   */
  decorative?: boolean;
}

const props = withDefaults(defineProps<PixelSpinnerProps>(), {
  size: 'md',
  label: SPINNER_DEFAULT_LABEL,
  surface: undefined,
  tone: 'cyan',
  decorative: false,
});

const surface = useEffectiveSurface(() => props.surface);
const reducedMotion = useReducedMotion();
const classes = computed(() => spinnerClasses(surface.value, props.size, props.tone));
const animation = computed(() => spinnerAnimation(surface.value, { reducedMotion: reducedMotion.value }));
// role=status already implies aria-live=polite, so it is not repeated.
const liveAttrs = computed(() =>
  props.decorative ? { 'aria-hidden': 'true' as const } : { role: 'status', 'aria-label': props.label },
);
</script>

<template>
  <span v-bind="liveAttrs" :class="classes.root">
    <span data-pxl-spinner-blade="true" aria-hidden="true" :class="classes.blade" :style="animation ? { animation } : undefined" />
    <span v-if="!decorative" class="sr-only">{{ label }}</span>
  </span>
</template>
