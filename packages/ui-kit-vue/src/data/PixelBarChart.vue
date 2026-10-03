<script setup lang="ts">
import { computed } from 'vue';
import {
  barChartClasses,
  barChartGeometry,
  chartShapeRendering,
  describeChart,
  type BarChartOrientation,
  type ChartSize,
  type PixelChartDataPoint,
  type Surface,
  type ToneKey,
} from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * One bar per data point, vertical or horizontal, on a scale that includes
 * zero, with optional value labels. The `<svg>` is an image (`role="img"`)
 * named by `aria-label`, or by a summary of the series (kind, point count
 * and range); other attributes go to it too.
 *
 * @example
 * <PixelBarChart :data="[{ x: 'Mon', y: 12 }, { x: 'Tue', y: 18 }]" orientation="horizontal" show-values />
 */
export interface PixelBarChartProps {
  /** The series, one bar per point. */
  data: PixelChartDataPoint[];
  /** Colour of the bars and their labels. */
  tone?: ToneKey;
  /** 160×64, 280×120 or 420×180 px. */
  size?: ChartSize;
  /** Bars growing up, or to the right. */
  orientation?: BarChartOrientation;
  /** Labels each bar with its value. */
  showValues?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Surface border and radius around the chart. */
  bordered?: boolean;
  /** Accessible name; a summary of the series when unset. */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<PixelBarChartProps>(), {
  tone: 'cyan',
  size: 'md',
  orientation: 'vertical',
  showValues: false,
  surface: undefined,
  bordered: false,
  ariaLabel: undefined,
});

const surface = useEffectiveSurface(() => props.surface);
const geometry = computed(() =>
  barChartGeometry(props.data, surface.value, {
    size: props.size,
    orientation: props.orientation,
    showValues: props.showValues,
  }),
);
const classes = computed(() => barChartClasses(surface.value, { tone: props.tone, bordered: props.bordered }));
const label = computed(() => props.ariaLabel ?? describeChart('bar chart', props.data));
</script>

<template>
  <svg
    role="img"
    :aria-label="label"
    :width="geometry.width"
    :height="geometry.height"
    :viewBox="`0 0 ${geometry.width} ${geometry.height}`"
    :shape-rendering="chartShapeRendering(surface)"
    :class="classes.root"
  >
    <rect
      v-for="(bar, index) in geometry.bars"
      :key="index"
      :x="bar.x"
      :y="bar.y"
      :width="bar.width"
      :height="bar.height"
      :rx="geometry.radius"
      :ry="geometry.radius"
      :class="classes.bar"
    />
    <template v-if="showValues">
      <text
        v-for="(bar, index) in geometry.bars"
        :key="`v-${index}`"
        :x="bar.labelX"
        :y="bar.labelY"
        :text-anchor="geometry.labelAnchor"
        font-size="9"
        :class="classes.value"
      >{{ bar.raw.y }}</text>
    </template>
  </svg>
</template>
