<script setup lang="ts">
import { computed, useTemplateRef } from 'vue';
import { checkboxClasses, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Checkbox (`role="checkbox"`) with a chunky pixel check mark, tones and
 * surfaces. Bind its state with `v-model:checked`, or leave it uncontrolled
 * with `default-checked`. With a `name` it submits `value` in forms while
 * checked. Extra attributes and listeners go to the checkbox `<button>`.
 */
export interface PixelCheckboxProps {
  /** Label rendered next to the box. */
  label: string;
  /** Checked state (`v-model:checked`); leave unset for an uncontrolled checkbox. */
  checked?: boolean;
  /** Initial checked state while uncontrolled. */
  defaultChecked?: boolean;
  /** Disables interaction and greys out the control. */
  disabled?: boolean;
  /** Tone of the checked box. */
  tone?: Tone;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Form field name — a hidden input submits `value` while checked. */
  name?: string;
  /** Form value while checked. */
  value?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
  /** `id` of the checkbox button. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelCheckboxProps>(), {
  checked: undefined,
  defaultChecked: false,
  disabled: false,
  tone: 'green',
  surface: undefined,
  name: undefined,
  value: 'on',
  required: false,
  id: undefined,
});

const emit = defineEmits<{
  /** The new checked state, after each toggle. */
  'update:checked': [checked: boolean];
}>();

const surface = useEffectiveSurface(() => props.surface);
const button = useTemplateRef<HTMLButtonElement>('button');
const [isChecked, setChecked] = useControllableState({
  value: () => props.checked,
  defaultValue: () => props.defaultChecked,
  onChange: (next) => emit('update:checked', next),
});

function toggle() {
  if (!props.disabled) setChecked(!isChecked.value);
}

const classes = computed(() =>
  checkboxClasses(surface.value, { tone: props.tone, checked: isChecked.value, disabled: props.disabled }),
);

defineExpose({
  /** The checkbox button. */
  element: button,
});
</script>

<template>
  <input v-if="name && isChecked" type="hidden" :name="name" :value="value" :required="required" />
  <button
    v-bind="$attrs"
    :id="id"
    ref="button"
    type="button"
    role="checkbox"
    :aria-checked="isChecked"
    :aria-disabled="disabled"
    :aria-required="required || undefined"
    :disabled="disabled"
    :class="classes.button"
    @click="toggle"
  >
    <span :class="classes.box"><PixelGlyph v-if="isChecked" name="check" :class="classes.check" /></span>
    <span :class="classes.label">{{ label }}</span>
  </button>
</template>
