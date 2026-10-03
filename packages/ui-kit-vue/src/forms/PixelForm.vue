<script setup lang="ts" generic="TValues extends GenericObject">
import { computed, provide, useTemplateRef, type VNode } from 'vue';
import type { FormContext, GenericObject } from 'vee-validate';
import { formClasses, type Surface } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';
import { PIXEL_FORM, type PixelFormFieldEntry } from './_internal/form-context.js';

/**
 * Validated form on VeeValidate: pass it the form `useForm` returns, and
 * compose `PixelFormField` / `PixelFormItem` / `PixelFormLabel` /
 * `PixelFormControl` / `PixelFormDescription` / `PixelFormMessage` inside.
 * Submitting validates every field: with errors, they show and the first
 * field with one takes focus; without, `@submit` gets the values. After the
 * first submission a field validates again as it changes, never on blur.
 * Call `useForm` in the component that renders the form, so its fields find
 * it. Extra attributes and listeners go to the `<form>`.
 *
 * @example
 * const form = useForm({ initialValues: { email: '' } });
 * <PixelForm :form="form" @submit="save">…</PixelForm>
 */
export interface PixelFormProps<TValues extends GenericObject = GenericObject> {
  /** The form: what VeeValidate's `useForm` returns. */
  form: FormContext<TValues>;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
}

const props = withDefaults(defineProps<PixelFormProps<TValues>>(), { surface: undefined });

const emit = defineEmits<{
  /** The form's values, once a submission finds no error. */
  submit: [values: TValues];
}>();

defineSlots<{
  /** The fields. */
  default?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => formClasses(surface.value));
const element = useTemplateRef<HTMLFormElement>('element');

const fields: PixelFormFieldEntry[] = [];
provide(PIXEL_FORM, {
  register(field) {
    fields.push(field);
    return () => {
      const index = fields.indexOf(field);
      if (index >= 0) fields.splice(index, 1);
    };
  },
});

/** Focuses the control of the first field with an error, in the order the fields were set up. */
function focusFirstError(hasError: (name: string) => boolean) {
  for (const field of fields) {
    const id = field.controlId();
    if (!id || !hasError(field.name())) continue;
    const control = element.value?.querySelector<HTMLElement>(`[id="${id}"]`);
    if (!control) continue;
    control.focus();
    return;
  }
}

function onSubmit(event: Event) {
  event.preventDefault();
  void props.form.handleSubmit(
    (values) => emit('submit', values as TValues),
    ({ errors }) => focusFirstError((name) => !!errors[name as keyof typeof errors]),
  )();
}
</script>

<template>
  <form ref="element" novalidate :class="classes" @submit="onSubmit">
    <slot />
  </form>
</template>
