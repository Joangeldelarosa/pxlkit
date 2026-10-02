<script setup lang="ts">
import { computed } from 'vue';
import {
  PROGRESS_DEFAULT_LABEL,
  clampProgress,
  progressClasses,
  progressFillWidth,
  progressSegmentClasses,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Progress bar (`role="progressbar"`, 0–100): ten segmented HP-bar blocks on
 * the pixel surface, a smooth filled track on the linear one. The label names
 * the bar ("Progress" without one); while indeterminate the bar pulses,
 * drops `aria-valuenow` and sets `aria-busy`.
 *
 * @example
 * <PixelProgress :value="60" label="HP" />
 */
export interface PixelProgressProps {
  /** Current value 0–100 (clamped). */
  value: number;
  /** Tone of the fill. */
  tone?: Tone;
  /**
   * Label above the bar, also its accessible name; the name falls back to
   * "Progress" without one.
   */
  label?: string;
  /** Show the percentage on the right. */
  showValue?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Unknown-duration work: the bar pulses and reports no value. */
  indeterminate?: boolean;
}

const props = withDefaults(defineProps<PixelProgressProps>(), {
  tone: 'green',
  label: undefined,
  showValue: true,
  surface: undefined,
  indeterminate: false,
});

const surface = useEffectiveSurface(() => props.surface);
const safe = computed(() => clampProgress(props.value));
const classes = computed(() => progressClasses(surface.value, props.tone, { indeterminate: props.indeterminate }));
const segments = computed(() => progressSegmentClasses(props.value, props.tone, { indeterminate: props.indeterminate }));
const fillWidth = computed(() => progressFillWidth(props.value, { indeterminate: props.indeterminate }));
</script>

<template>
  <div :class="classes.root">
    <div v-if="label || showValue" :class="classes.header">
      <span v-if="label">{{ label }}</span>
      <span v-if="showValue && !indeterminate" :class="classes.value">{{ safe }}%</span>
    </div>
    <div
      role="progressbar"
      :aria-valuenow="indeterminate ? undefined : safe"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="label ?? PROGRESS_DEFAULT_LABEL"
      :aria-busy="indeterminate || undefined"
      :class="classes.track"
    >
      <template v-if="surface === 'pixel'">
        <div v-for="(segment, i) in segments" :key="i" :class="segment" />
      </template>
      <div v-else :class="classes.fill" :style="{ width: fillWidth }" />
    </div>
  </div>
</template>
