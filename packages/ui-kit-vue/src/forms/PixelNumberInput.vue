<script setup lang="ts">
import { computed, ref, useAttrs, useId, useTemplateRef, watch } from 'vue';
import {
  clampNumber,
  fieldDescribedBy,
  fieldMessageId,
  formatNumberInput,
  numberInputAtLimit,
  numberInputClasses,
  parseNumberInput,
  settleNumberInput,
  stepNumberInput,
  type NumberInputClampBehavior,
  type Size,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import FieldShell from '../_internal/FieldShell.vue';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Numeric field (`role="spinbutton"`) with ArrowUp / ArrowDown and stepper
 * buttons, min / max clamping, precision, a prefix and suffix, and a
 * thousands separator. Bind its value with `v-model`, or leave it
 * uncontrolled with `default-value`. With a `name` a hidden input submits the
 * number in forms. Extra attributes and listeners go to the `<input>`.
 */
export interface PixelNumberInputProps {
  /** Value (`v-model`); leave unset for an uncontrolled field. */
  modelValue?: number;
  /** Initial value while uncontrolled. */
  defaultValue?: number;
  /** Lowest value. */
  min?: number;
  /** Highest value. */
  max?: number;
  /** Amount each step adds or removes. */
  step?: number;
  /** Decimals shown, and the value is rounded to. */
  precision?: number;
  /** When a value outside `min` / `max` is pulled back: while typing, on blur, or never. */
  clampBehavior?: NumberInputClampBehavior;
  /** Text inside the field on the left (`$`). */
  prefix?: string;
  /** Text inside the field on the right (`USD`). */
  suffix?: string;
  /** Groups the integer digits (`,` shows `1,500,000`). */
  thousandsSeparator?: string;
  /** Accepts negative numbers. */
  allowNegative?: boolean;
  /** Hides the stepper buttons. */
  hideControls?: boolean;
  /** Field height. */
  size?: Size;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Tone of the focus ring. */
  tone?: Tone;
  /** Label rendered above the field. */
  label?: string;
  /** Helper text below the field; hidden while `error` is set. */
  hint?: string;
  /** Error message below the field; marks the input invalid. */
  error?: string;
  /** Disables the field and its steppers. */
  disabled?: boolean;
  /** Form field name — a hidden input submits the number. */
  name?: string;
  /** `id` of the input; generated when left out. */
  id?: string;
  /** Text shown while the field is empty. */
  placeholder?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelNumberInputProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  min: undefined,
  max: undefined,
  step: 1,
  precision: undefined,
  clampBehavior: 'blur',
  prefix: undefined,
  suffix: undefined,
  thousandsSeparator: undefined,
  allowNegative: true,
  hideControls: false,
  size: 'md',
  surface: undefined,
  tone: 'neutral',
  label: undefined,
  hint: undefined,
  error: undefined,
  disabled: false,
  name: undefined,
  id: undefined,
  placeholder: undefined,
});

const emit = defineEmits<{
  /** The new number, after each step, edit that reads as a number, or settle on blur. */
  'update:modelValue': [value: number];
}>();

const surface = useEffectiveSurface(() => props.surface);
const generatedId = useId();
const inputId = computed(() => props.id ?? `pxl-number-${generatedId}`);
const attrs = useAttrs();
// Attributes are not reactive: the consumer's `aria-describedby` is read while
// rendering, and the hint / error is added to it while one shows.
const describedBy = () =>
  fieldDescribedBy(inputId.value, props, attrs['aria-describedby'] as string | undefined);
const input = useTemplateRef<HTMLInputElement>('input');

const [current, setCurrent] = useControllableState<number | undefined>({
  value: () => props.modelValue,
  defaultValue: () => props.modelValue ?? props.defaultValue,
  onChange: (next) => {
    if (typeof next === 'number' && !Number.isNaN(next)) emit('update:modelValue', next);
  },
});

const limits = computed(() => ({ min: props.min, max: props.max, precision: props.precision }));
const format = (value: number | undefined) => formatNumberInput(value, props.precision, props.thousandsSeparator);

// What the field shows. It does not follow the value while focused, so
// partial input such as "" or "-" survives typing.
const display = ref(format(current.value));
let focused = false;
watch([current, () => props.precision, () => props.thousandsSeparator], () => {
  if (!focused) display.value = format(current.value);
});

const classes = computed(() =>
  numberInputClasses(surface.value, {
    tone: props.tone,
    size: props.size,
    invalid: !!props.error,
    prefix: !!props.prefix,
    suffix: !!props.suffix,
    hideControls: props.hideControls,
  }),
);

function bump(direction: 1 | -1) {
  if (props.disabled) return;
  const next = stepNumberInput(current.value, direction, props.step, limits.value);
  setCurrent(next);
  // A step taken from the keyboard shows its result itself.
  if (focused) display.value = format(next);
}

// A stepper at its bound is disabled: like any disabled button, it ignores clicks.
function stepFromButton(direction: 1 | -1) {
  if (!numberInputAtLimit(current.value, direction, limits.value)) bump(direction);
}

function onInput(event: Event) {
  const { text, num } = parseNumberInput((event.target as HTMLInputElement).value, props.thousandsSeparator, props.allowNegative);
  display.value = text;
  if (num === undefined) return;
  let next = num;
  if (props.clampBehavior === 'strict') {
    next = clampNumber(next, props.min, props.max);
    if (next !== num) display.value = format(next);
  }
  setCurrent(next);
}

function onFocus() {
  focused = true;
}

function onBlur() {
  focused = false;
  const value = current.value;
  if (typeof value === 'number') {
    const next = settleNumberInput(value, props.clampBehavior, limits.value);
    if (next !== value) setCurrent(next);
    display.value = format(next);
  } else {
    display.value = '';
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    bump(1);
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    bump(-1);
  }
}

defineExpose({
  /** The native input. */
  element: input,
});
</script>

<template>
  <FieldShell
    :label="label"
    :hint="hint"
    :error="error"
    :surface="surface"
    :html-for="inputId"
    :message-id="fieldMessageId(inputId)"
  >
    <span :class="classes.shell">
      <span v-if="prefix" aria-hidden="true" :class="classes.prefix">{{ prefix }}</span>
      <input
        :id="inputId"
        ref="input"
        type="text"
        inputmode="decimal"
        role="spinbutton"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="current"
        :aria-invalid="error ? true : undefined"
        :disabled="disabled"
        :placeholder="placeholder"
        :value="display"
        :class="classes.input"
        v-bind="$attrs"
        :aria-describedby="describedBy()"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
        @keydown="onKeydown"
      />
      <span v-if="suffix" aria-hidden="true" :class="classes.suffix">{{ suffix }}</span>
      <span v-if="!hideControls" :class="classes.controls">
        <button
          type="button"
          tabindex="-1"
          aria-label="Increment"
          :disabled="disabled || numberInputAtLimit(current, 1, limits)"
          :class="classes.stepper"
          @click="stepFromButton(1)"
        >
          ▲
        </button>
        <button
          type="button"
          tabindex="-1"
          aria-label="Decrement"
          :disabled="disabled || numberInputAtLimit(current, -1, limits)"
          :class="classes.stepper"
          @click="stepFromButton(-1)"
        >
          ▼
        </button>
      </span>
      <input v-if="name" type="hidden" :name="name" :value="typeof current === 'number' ? String(current) : ''" />
    </span>
  </FieldShell>
</template>
