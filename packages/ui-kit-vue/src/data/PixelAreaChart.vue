<script setup lang="ts">
import { computed } from 'vue';
import {
  areaChartClasses,
  areaChartGeometry,
  areaChartGlow,
  areaChartStroke,
  chartShapeRendering,
  describeChart,
  type ChartSize,
  type PixelChartDataPoint,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * A series drawn as a filled polygon closed down to the baseline. The
 * polygon stays polygonal, so the pixel surface keeps crisp edges; `smooth`
 * rounds its joins on the linear surface. The `<svg>` is an image
 * (`role="img"`) named by `aria-label`, or by a summary of the series (kind,
 * point count and range); other attributes go to it too.
 *
 * @example
 * <PixelAreaChart :data="[{ x: 'Mon', y: 12 }, { x: 'Tue', y: 18 }]" smooth tone="green" />
 */
export interface PixelAreaChartProps {
  /** The series. Points are spread evenly; `x` only labels them, and one whose `y` is not finite is left out. */
  data: PixelChartDataPoint[];
  /** Colour of the outline and the fill. */
  tone?: ToneKey;
  /** 120×32, 240×60 or 360×96 px. */
  size?: ChartSize;
  /** Rounds the outline's joins (linear surface only). */
  smooth?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Surface border and radius around the chart. */
  bordered?: boolean;
  /** Accessible name; a summary of the series when unset. */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<PixelAreaChartProps>(), {
  tone: 'cyan',
  size: 'md',
  smooth: false,
  surface: undefined,
  bordered: false,
  ariaLabel: undefined,
});

const surface = useEffectiveSurface(() => props.surface);
const geometry = computed(() => areaChartGeometry(props.data, props.size));
const stroke = computed(() => areaChartStroke(surface.value, props.smooth));
const classes = computed(() => areaChartClasses(surface.value, { tone: props.tone, bordered: props.bordered }));
const label = computed(() => props.ariaLabel ?? describeChart('area chart', props.data));
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
    :data-tone-glow="areaChartGlow(tone)"
    :data-smooth="smooth || undefined"
  >
    <polygon
      v-if="geometry.polygon"
      :points="geometry.polygon"
      :stroke-width="stroke.width"
      :stroke-linejoin="stroke.linejoin"
      :class="classes.polygon"
      fill-opacity="0.25"
    />
  </svg>
</template>
