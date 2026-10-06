<script setup lang="ts">
import { computed } from 'vue';
import { segmentClasses, segmentedClasses, segmentedGroupName, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';
import type { Option } from './_internal/option.js';

/**
 * Single-select segmented control: a row of `aria-pressed` buttons under an
 * optional caption, named by `label` or `aria-label`. Bind the selected
 * value with `v-model`; left unbound, the control keeps its own selection,
 * starting with none. With a `name` a hidden input submits the value in
 * forms.
 */
export interface PixelSegmentedProps {
  /** Caption above the segments; omitted when empty. */
  label?: string;
  /** Selected value (`v-model`); leave unset for an uncontrolled control. */
  modelValue?: string;
  /** The segments. */
  options: Option[];
  /** Disables every segment. */
  disabled?: boolean;
  /** Tone of the selected segment. */
  tone?: Tone;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Form field name — a hidden input submits the value. */
  name?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
  /** Accessible name of the segments when no visible `label` is shown. */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<PixelSegmentedProps>(), {
  label: undefined,
  modelValue: undefined,
  disabled: false,
  tone: 'green',
  surface: undefined,
  name: undefined,
  required: false,
  ariaLabel: undefined,
});

const emit = defineEmits<{
  /** The value of the segment the user picked. */
  'update:modelValue': [value: string];
}>();

const surface = useEffectiveSurface(() => props.surface);
const [value, setValue] = useControllableState<string>({
  value: () => props.modelValue,
  defaultValue: () => '',
  onChange: (next) => emit('update:modelValue', next),
});

const classes = computed(() => segmentedClasses(surface.value, props.disabled));
const groupName = computed(() => segmentedGroupName(props.ariaLabel, props.label));
const segments = computed(() =>
  props.options.map((option) => {
    const active = value.value === option.value;
    return {
      option,
      active,
      class: segmentClasses(surface.value, { tone: props.tone, active, disabled: props.disabled }),
    };
  }),
);

function select(option: Option) {
  if (!props.disabled) setValue(option.value);
}
</script>

<template>
  <div :class="classes.root">
    <input v-if="name" type="hidden" :name="name" :value="value" :required="required" />
    <p v-if="label" :class="classes.label">{{ label }}</p>
    <div :role="groupName ? 'group' : undefined" :aria-label="groupName" :class="classes.track">
      <button
        v-for="segment in segments"
        :key="segment.option.value"
        type="button"
        :aria-pressed="segment.active"
        :aria-disabled="disabled"
        :disabled="disabled"
        :class="segment.class"
        @click="select(segment.option)"
      >
        {{ segment.option.label }}
      </button>
    </div>
  </div>
</template>
