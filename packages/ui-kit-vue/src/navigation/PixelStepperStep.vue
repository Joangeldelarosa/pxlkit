<script setup lang="ts">
import { computed, useTemplateRef, watch, type VNode } from 'vue';
import { stepAriaLabel, stepClasses, stepIndicator, stepSpinner, stepState, stepperKeyAction } from '@pxlkit/ui-kit-core';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { useStepPosition, useStepperContext } from './_internal/stepper-context.js';

/**
 * One step of a `PixelStepper`: an indicator (its number, a check mark once
 * completed, a cross on error, the `#icon` slot, or a spinner while loading)
 * and its label, named for assistive technology by its position, label and
 * state. Attributes and listeners fall through to the step element.
 */
export interface PixelStepperStepProps {
  /** Label under (or beside) the indicator. */
  label: string;
  /** Smaller text below the label. */
  description?: string;
  /** Shows a spinner in the indicator. */
  loading?: boolean;
  /** Marks the step done, with a check mark. */
  completed?: boolean;
  /** Marks the step failed, with a cross; wins over `completed`. */
  error?: boolean;
}

const props = withDefaults(defineProps<PixelStepperStepProps>(), {
  description: undefined,
  loading: false,
  completed: false,
  error: false,
});
const slots = defineSlots<{
  /** Custom icon in the indicator, shown while the step is neither completed nor in error. */
  icon?(): VNode[];
}>();

const context = useStepperContext();
const position = useStepPosition();
const step = useTemplateRef<HTMLElement>('step');
// Read while rendering: slots are not reactive.
const indicator = () => stepIndicator(state.value, { loading: props.loading, icon: !!slots.icon });

const state = computed(() => stepState(position.index, context.active.value, props));
const clickable = computed(() => context.clickable(position.index));
const classes = computed(() =>
  stepClasses(context.surface.value, {
    orientation: context.orientation.value,
    size: context.size.value,
    state: state.value,
    clickable: clickable.value,
  }),
);

watch(
  [step, () => position.index],
  ([element, index], _previous, onCleanup) => {
    if (element) onCleanup(context.registerStep(index, element));
  },
  { flush: 'post' },
);

function onClick() {
  if (clickable.value) context.select(position.index);
}

function onKeydown(event: KeyboardEvent) {
  const action = stepperKeyAction(event.key, context.orientation.value);
  if (action === undefined) return;
  if (action === 'select') {
    if (!clickable.value) return;
    event.preventDefault();
    context.select(position.index);
    return;
  }
  event.preventDefault();
  context.moveFocus(position.index, action, position.total);
}
</script>

<template>
  <div
    ref="step"
    data-pxl-step="true"
    :data-pxl-step-index="position.index"
    :data-pxl-step-state="state"
    :aria-current="position.index === context.active.value ? 'step' : undefined"
    :aria-label="stepAriaLabel(position.index, position.total, label, state)"
    :tabindex="clickable ? 0 : -1"
    :class="classes.root"
    @click="onClick"
    @keydown="onKeydown"
  >
    <span aria-hidden="true" data-pxl-step-indicator="true" :class="classes.indicator">
      <svg
        v-if="indicator() === 'loading'"
        :class="classes.spinner"
        :viewBox="stepSpinner.viewBox"
        fill="none"
        shape-rendering="crispEdges"
        aria-hidden="true"
        data-pxl-step-icon="loading"
      >
        <rect
          v-for="[x, y, width, height, opacity] in stepSpinner.rects"
          :key="`${x}-${y}`"
          :x="x"
          :y="y"
          :width="width"
          :height="height"
          fill="currentColor"
          :opacity="opacity"
        />
      </svg>
      <span v-else-if="indicator() === 'check'" data-pxl-step-icon="check" :class="classes.icon"><PixelGlyph name="check" /></span>
      <span v-else-if="indicator() === 'error'" data-pxl-step-icon="error" :class="classes.icon"><PixelGlyph name="close" /></span>
      <span v-else-if="indicator() === 'custom'" data-pxl-step-icon="custom" :class="classes.icon" aria-hidden="true">
        <slot name="icon" />
      </span>
      <span v-else :class="classes.number">{{ position.index + 1 }}</span>
    </span>
    <div :class="classes.body">
      <span data-pxl-step-label="true" :class="classes.label">{{ label }}</span>
      <span v-if="description" data-pxl-step-description="true" :class="classes.description">{{ description }}</span>
    </div>
  </div>
</template>
