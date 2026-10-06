<script setup lang="ts">
import { computed, type VNode } from 'vue';
import {
  timelineAsciiConnector,
  timelineItemClasses,
  timelineItemState,
  type PixelTimelineLineVariant,
} from '@pxlkit/ui-kit-core';
import { useTimelineContext, useTimelinePosition } from './_internal/timeline-context.js';

/**
 * One entry of a `PixelTimeline`: its bullet, the rail down to the next
 * entry, the label and time, and the default slot as its description.
 * Attributes go to the `<li>`.
 */
export interface PixelTimelineItemProps {
  /** Entry label. */
  label?: string;
  /** @deprecated Use `label`. */
  title?: string;
  /** Time or date beside the label. */
  time?: string;
  /** Line style of the rail down to the next entry. */
  lineVariant?: PixelTimelineLineVariant;
}

const props = withDefaults(defineProps<PixelTimelineItemProps>(), {
  label: undefined,
  title: undefined,
  time: undefined,
  lineVariant: 'solid',
});
defineSlots<{
  /** Description below the label. */
  default?(): VNode[];
  /** Content of the bullet. */
  bullet?(): VNode[];
}>();

const context = useTimelineContext();
const position = useTimelinePosition();
const state = computed(() => timelineItemState(position.index, context.active.value));
const classes = computed(() =>
  timelineItemClasses(context.surface.value, {
    state: state.value,
    align: context.align.value,
    bulletSize: context.bulletSize.value,
    lineVariant: props.lineVariant,
  }),
);
const ascii = computed(() => timelineAsciiConnector(context.surface.value));
</script>

<template>
  <li :data-pxl-state="state" :aria-current="state === 'active' ? 'step' : undefined" :class="classes.root">
    <span
      v-if="position.index !== position.total - 1"
      data-pxl-connector="true"
      aria-hidden="true"
      :class="classes.connector"
    />
    <span data-pxl-bullet="true" aria-hidden="true" :class="classes.bullet"><slot name="bullet" /></span>
    <span v-if="ascii" aria-hidden="true" class="sr-only" data-pxl-ascii="true">{{ ascii }}</span>
    <div :class="classes.body">
      <div :class="classes.heading">
        <span :class="classes.label">{{ label ?? title ?? '' }}</span>
        <span v-if="time" :class="classes.time">{{ time }}</span>
      </div>
      <div v-if="$slots.default" :class="classes.description"><slot /></div>
    </div>
  </li>
</template>
