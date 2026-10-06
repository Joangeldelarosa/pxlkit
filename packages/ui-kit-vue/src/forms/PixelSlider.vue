<script setup lang="ts" generic="T extends SliderValue">
import { computed, ref, useTemplateRef } from 'vue';
import {
  isSliderRange,
  moveSliderThumb,
  nearestSliderThumb,
  sliderClasses,
  sliderFill,
  sliderKeyValue,
  sliderPercent,
  sliderThumbLabel,
  sliderThumbLeft,
  sliderThumbValues,
  sliderTicks,
  sliderTooltipVisible,
  sliderValueAt,
  sliderValueText,
  type SliderThumb,
  type SliderTooltipMode,
  type SliderValue,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import { RenderNode, type PxlNode } from '../_internal/render-node.js';
import { useEffectiveSurface } from '../composables/surface.js';

/** A labelled mark on the track. */
export interface PixelSliderMark {
  /** Value the mark sits at. */
  value: number;
  /** Its label: text, a VNode or a render function. */
  label: PxlNode;
}

/**
 * Slider with one thumb, or two bounding a range when its value is a
 * `[low, high]` pair — the lower thumb never passes the upper one. Drag the
 * thumbs or use the arrows (one step), PageUp / PageDown (ten steps), Home
 * and End. Optional marks, a tick per step and the values above the thumbs.
 * Bind the value with `v-model`; with a `name` hidden inputs submit it
 * (`name[0]` and `name[1]` for a range).
 */
export interface PixelSliderProps<T extends SliderValue = number> {
  /** Label above the track; also names the thumbs. */
  label: string;
  /** Value (`v-model`): a number, or a `[low, high]` pair for a range. */
  modelValue: T;
  /** Lowest value. */
  min?: number;
  /** Highest value. */
  max?: number;
  /** Distance between two values, counted from `min`: the slider takes `min`, `min + step`… up to `max`. */
  step?: number;
  /** Disables dragging and the keys and greys out the track. */
  disabled?: boolean;
  /** Tone of the fill and thumbs. */
  tone?: Tone;
  /** Shows `min` and `max` under the track. */
  showMinMax?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Form field name of the hidden inputs. */
  name?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
  /** `id` of the single (or lower) thumb. */
  id?: string;
  /** Labelled marks under the track. */
  marks?: PixelSliderMark[];
  /** When a thumb shows its value: `always`, while dragged or focused (`drag`), or `never`. */
  showTooltip?: SliderTooltipMode;
  /** Draws a tick under the track for every step. */
  ticks?: boolean;
}

const props = withDefaults(defineProps<PixelSliderProps<T>>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  tone: 'cyan',
  showMinMax: false,
  surface: undefined,
  name: undefined,
  required: false,
  id: undefined,
  marks: undefined,
  showTooltip: 'never',
  ticks: false,
});

const emit = defineEmits<{
  /** The new value, as a thumb is dragged or moved with the keys. */
  'update:modelValue': [value: T];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => sliderClasses(surface.value, { tone: props.tone, disabled: props.disabled }));
const bounds = computed(() => ({ min: props.min, max: props.max, step: props.step }));
const range = computed(() => isSliderRange(props.modelValue));
const thumbValues = computed(() => sliderThumbValues(props.modelValue));
const thumbs = computed<SliderThumb[]>(() => (range.value ? [0, 1] : [0]));
const fill = computed(() => sliderFill(props.modelValue, props.min, props.max));
const tickValues = computed(() => (props.ticks ? sliderTicks(bounds.value) : []));
const percent = (value: number) => sliderPercent(value, props.min, props.max);

const track = useTemplateRef<HTMLDivElement>('track');
// The thumb being dragged; the one dragged or focused shows a `drag` tooltip.
let dragging: SliderThumb | null = null;
const active = ref<SliderThumb | null>(null);

function moveThumb(thumb: SliderThumb, next: number) {
  emit('update:modelValue', moveSliderThumb(props.modelValue, thumb, next, bounds.value) as T);
}

function valueAt(clientX: number): number {
  if (!track.value) return props.min;
  return sliderValueAt(clientX, track.value.getBoundingClientRect(), props.min, props.max);
}

function onPointerDown(event: PointerEvent) {
  if (props.disabled) return;
  event.preventDefault();
  const thumb = range.value ? nearestSliderThumb(props.modelValue, valueAt(event.clientX)) : 0;
  dragging = thumb;
  active.value = thumb;
  // Captured, the track keeps getting the moves when the pointer leaves it.
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  moveThumb(thumb, valueAt(event.clientX));
}

function onPointerMove(event: PointerEvent) {
  if (dragging === null || props.disabled) return;
  moveThumb(dragging, valueAt(event.clientX));
}

function onPointerUp() {
  dragging = null;
  active.value = null;
}

function onKeydown(thumb: SliderThumb, event: KeyboardEvent) {
  if (props.disabled) return;
  const next = sliderKeyValue(event.key, thumbValues.value[thumb], bounds.value);
  if (next === undefined) return;
  event.preventDefault();
  moveThumb(thumb, next);
}

function onBlur(thumb: SliderThumb) {
  if (active.value === thumb) active.value = null;
}
</script>

<template>
  <div :class="classes.root">
    <template v-if="name">
      <template v-if="range">
        <input type="hidden" :name="`${name}[0]`" :value="thumbValues[0]" :required="required" />
        <input type="hidden" :name="`${name}[1]`" :value="thumbValues[1]" :required="required" />
      </template>
      <input v-else type="hidden" :name="name" :value="thumbValues[0]" :required="required" />
    </template>
    <div :class="classes.header">
      <span>{{ label }}</span>
      <span :class="classes.value">{{ sliderValueText(modelValue) }}</span>
    </div>
    <div
      ref="track"
      :role="range ? 'group' : undefined"
      :aria-label="range ? label : undefined"
      :class="classes.track"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div :class="classes.fill" :style="{ left: `${fill.left}%`, width: `${fill.width}%`, opacity: 0.8 }" />
      <div
        v-for="thumb in thumbs"
        :id="thumb === 0 ? id : undefined"
        :key="thumb"
        role="slider"
        :tabindex="disabled ? -1 : 0"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="thumbValues[thumb]"
        :aria-label="sliderThumbLabel(label, range, thumb)"
        :aria-disabled="disabled"
        :aria-required="range ? undefined : required || undefined"
        :class="classes.thumb"
        :style="{ left: sliderThumbLeft(percent(thumbValues[thumb])) }"
        @keydown="onKeydown(thumb, $event)"
        @focus="active = thumb"
        @blur="onBlur(thumb)"
      >
        <span v-if="sliderTooltipVisible(showTooltip, active, thumb)" role="tooltip" :class="classes.tooltip">
          {{ thumbValues[thumb] }}
        </span>
      </div>
    </div>
    <div v-if="ticks && tickValues.length > 0" :class="classes.ticks" aria-hidden="true">
      <span
        v-for="(tick, i) in tickValues"
        :key="i"
        data-testid="pxl-slider-tick"
        :class="classes.tick"
        :style="{ left: `${percent(tick)}%` }"
      />
    </div>
    <div v-if="marks && marks.length > 0" :class="classes.marks" data-testid="pxl-slider-marks">
      <span v-for="(mark, i) in marks" :key="i" :class="classes.mark" :style="{ left: `${percent(mark.value)}%` }">
        <RenderNode :node="mark.label" />
      </span>
    </div>
    <div v-if="showMinMax" :class="classes.bounds">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>
