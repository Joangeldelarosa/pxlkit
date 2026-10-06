<script setup lang="ts" generic="TValue = unknown">
import { computed, inject, onBeforeUnmount, provide, type VNode } from 'vue';
import { useField, useSubmitCount, type RuleExpression } from 'vee-validate';
import { PIXEL_FORM, PIXEL_FORM_FIELD } from './_internal/form-context.js';

/** What a field binds to its control: `v-bind="field"` on a kit field or any `v-model` component. */
export interface PixelFormFieldBinding<TValue = unknown> {
  name: string;
  modelValue: TValue;
  'onUpdate:modelValue': (value: TValue) => void;
  onBlur: (event: FocusEvent) => void;
}

/** The state of a field, as its slot receives it. */
export interface PixelFormFieldState {
  /** The field shows an error. */
  invalid: boolean;
  /** The field's control lost focus at least once. */
  isTouched: boolean;
  /** The value differs from the initial one. */
  isDirty: boolean;
  /** An asynchronous rule is running. */
  isValidating: boolean;
  /** The error the field shows. */
  error?: { message: string };
}

/**
 * One field of a `PixelForm`, registered with VeeValidate's `useField`: its
 * default slot receives `field`, to bind to the control
 * (`<PixelInput v-bind="field" />`), and `fieldState`. Like React Hook
 * Form's default modes, the field validates when the form is submitted and,
 * after that, as its value changes; never on blur.
 */
export interface PixelFormFieldProps<TValue = unknown> {
  /** Path of the field in the form's values. */
  name: string;
  /** VeeValidate rules: a function returning `true` or a message, an array of them, or a schema. */
  rules?: RuleExpression<TValue>;
  /** Initial value, where the form's `initialValues` have none. */
  defaultValue?: TValue;
  /** Drops the field's value from the form when it unmounts; by default the value stays. */
  shouldUnregister?: boolean;
}

const props = withDefaults(defineProps<PixelFormFieldProps<TValue>>(), {
  rules: undefined,
  defaultValue: undefined,
  shouldUnregister: false,
});

defineSlots<{
  /** The field's item: bind `field` to its control. */
  default?(props: { field: PixelFormFieldBinding<TValue>; fieldState: PixelFormFieldState }): VNode[];
}>();

const rules = computed(() => props.rules);
const { value, errorMessage, meta, handleChange, handleBlur } = useField<TValue>(() => props.name, rules, {
  initialValue: props.defaultValue,
  validateOnValueUpdate: false,
  keepValueOnUnmount: () => !props.shouldUnregister,
});
const submitCount = useSubmitCount();

const field = computed<PixelFormFieldBinding<TValue>>(() => ({
  name: props.name,
  modelValue: value.value,
  'onUpdate:modelValue': (next) => handleChange(next, submitCount.value > 0),
  onBlur: (event) => handleBlur(event),
}));
const fieldState = computed<PixelFormFieldState>(() => ({
  invalid: !!errorMessage.value,
  isTouched: meta.touched,
  isDirty: meta.dirty,
  isValidating: meta.pending,
  error: errorMessage.value ? { message: errorMessage.value } : undefined,
}));

let controlId: string | undefined;
const unregister = inject(PIXEL_FORM, null)?.register({ name: () => props.name, controlId: () => controlId });
onBeforeUnmount(() => unregister?.());

provide(PIXEL_FORM_FIELD, {
  error: errorMessage,
  setControl(id) {
    controlId = id;
  },
});
</script>

<template>
  <slot :field="field" :field-state="fieldState" />
</template>
