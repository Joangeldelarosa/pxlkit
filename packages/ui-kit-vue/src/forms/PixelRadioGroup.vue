<script setup lang="ts">
import { computed } from 'vue';
import { radioGroupClasses, radioIndicatorClasses, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';
import type { Option } from './_internal/option.js';

/**
 * Single-select radios in a `<fieldset role="radiogroup">` whose `<legend>`
 * is the label, with a pixel dot indicator, tones and surfaces. Bind the
 * selected value with `v-model`; left unbound, the group keeps its own
 * selection, starting with none. With a `name` a hidden input submits the
 * value in forms.
 */
export interface PixelRadioGroupProps {
  /** Legend rendered above the radios. */
  label: string;
  /** Selected value (`v-model`); leave unset for an uncontrolled group. */
  modelValue?: string;
  /** The radios. */
  options: Option[];
  /** Disables every radio. */
  disabled?: boolean;
  /** Tone of the selected radio. */
  tone?: Tone;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Form field name — a hidden input submits the value. */
  name?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
}

const props = withDefaults(defineProps<PixelRadioGroupProps>(), {
  modelValue: undefined,
  disabled: false,
  tone: 'cyan',
  surface: undefined,
  name: undefined,
  required: false,
});

const emit = defineEmits<{
  /** The value of the radio the user picked. */
  'update:modelValue': [value: string];
}>();

const surface = useEffectiveSurface(() => props.surface);
const [value, setValue] = useControllableState<string>({
  value: () => props.modelValue,
  defaultValue: () => '',
  onChange: (next) => emit('update:modelValue', next),
});

const classes = computed(() => radioGroupClasses(surface.value, props.disabled));
const radios = computed(() =>
  props.options.map((option) => {
    const checked = value.value === option.value;
    return {
      option,
      checked,
      ...radioIndicatorClasses(surface.value, { tone: props.tone, checked, disabled: props.disabled }),
    };
  }),
);

function select(option: Option) {
  if (!props.disabled) setValue(option.value);
}
</script>

<template>
  <fieldset :class="classes.group" role="radiogroup" :aria-disabled="disabled" :aria-required="required || undefined">
    <input v-if="name" type="hidden" :name="name" :value="value" :required="required" />
    <legend :class="classes.legend">{{ label }}</legend>
    <button
      v-for="radio in radios"
      :key="radio.option.value"
      type="button"
      role="radio"
      :aria-checked="radio.checked"
      :aria-disabled="disabled"
      :disabled="disabled"
      :class="classes.radio"
      @click="select(radio.option)"
    >
      <span :class="radio.indicator"><span v-if="radio.checked" :class="radio.dot" /></span>
      <span :class="classes.label">{{ radio.option.label }}</span>
    </button>
  </fieldset>
</template>
