<script setup lang="ts">
import { computed } from 'vue';
import {
  chartShapeRendering,
  describeChart,
  sparklineClasses,
  sparklineGeometry,
  sparklineStroke,
  type ChartSize,
  type PixelChartDataPoint,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * A series drawn as one polyline, with an optional area filled underneath.
 * The `<svg>` is an image (`role="img"`) named by `aria-label`, or by a
 * summary of the series (kind, point count and range); other attributes go
 * to it too.
 *
 * @example
 * <PixelSparkline :data="[{ x: 'Mon', y: 12 }, { x: 'Tue', y: 18 }]" tone="green" show-area />
 */
export interface PixelSparklineProps {
  /** The series. Points are spread evenly; `x` only labels them, and one whose `y` is not finite is left out. */
  data: PixelChartDataPoint[];
  /** Colour of the line and the area. */
  tone?: ToneKey;
  /** 120×32, 240×60 or 360×96 px. */
  size?: ChartSize;
  /** Fills the area under the line, faintly. */
  showArea?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Surface border and radius around the chart. */
  bordered?: boolean;
  /** Accessible name; a summary of the series when unset. */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<PixelSparklineProps>(), {
  tone: 'cyan',
  size: 'md',
  showArea: false,
  surface: undefined,
  bordered: false,
  ariaLabel: undefined,
});

const surface = useEffectiveSurface(() => props.surface);
const geometry = computed(() => sparklineGeometry(props.data, props.size));
const stroke = computed(() => sparklineStroke(surface.value));
const classes = computed(() => sparklineClasses(surface.value, { tone: props.tone, bordered: props.bordered }));
const label = computed(() => props.ariaLabel ?? describeChart('sparkline', props.data));
</script>

<template>
  <svg
    role="img"
    :aria-label="label"
    :width="geometry.width"
    :height="geometry.height"
    :viewBox="`0 0 ${geometry.width} ${geometry.height}`"
    preserveAspectRatio="none"
    :shape-rendering="chartShapeRendering(surface)"
    :class="classes.root"
  >
    <polygon v-if="showArea && geometry.area" :points="geometry.area" :class="classes.area" stroke="none" />
    <polyline
      :points="geometry.line"
      fill="none"
      :stroke-width="stroke.width"
      :stroke-linejoin="stroke.linejoin"
      :stroke-linecap="stroke.linecap"
      :class="classes.line"
    />
  </svg>
</template>
