<script setup lang="ts">
import { computed, ref, useId, useTemplateRef } from 'vue';
import { passwordInputClasses, type Size, type Surface, type Tone } from '@pxlkit/ui-kit-core';
import FieldShell from '../_internal/FieldShell.vue';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Password field with an inline show / hide toggle (a `<button>` with
 * `aria-pressed`, left out of the tab order) that swaps the input between
 * `password` and `text`. Bind its value with `v-model`, or leave it
 * uncontrolled with `default-value`. Extra attributes and listeners go to the
 * `<input>`.
 */
export interface PixelPasswordInputProps {
  /** Value (`v-model`); leave unset for an uncontrolled input. */
  modelValue?: string;
  /** Initial value while uncontrolled. */
  defaultValue?: string;
  /** Label rendered above the input. */
  label?: string;
  /** Helper text below the field; hidden while `error` is set. */
  hint?: string;
  /** Error message below the field; marks the input invalid. */
  error?: string;
  /** Tone of the focus ring. */
  tone?: Tone;
  /** Field height. */
  size?: Size;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Text of the toggle, as `[showLabel, hideLabel]`. */
  toggleLabels?: [string, string];
  /** Disables the input and the toggle. */
  disabled?: boolean;
  /** `id` of the input; generated when left out. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelPasswordInputProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  label: undefined,
  hint: undefined,
  error: undefined,
  tone: 'neutral',
  size: 'md',
  surface: undefined,
  toggleLabels: () => ['Show', 'Hide'],
  disabled: false,
  id: undefined,
});

const emit = defineEmits<{
  /** The new value, on every edit. */
  'update:modelValue': [value: string];
}>();

const surface = useEffectiveSurface(() => props.surface);
const generatedId = useId();
const inputId = computed(() => props.id ?? `pxl-password-${generatedId}`);
const input = useTemplateRef<HTMLInputElement>('input');
const visible = ref(false);

const [value, setValue] = useControllableState<string | undefined>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue,
  onChange: (next) => emit('update:modelValue', next ?? ''),
});

const classes = computed(() =>
  passwordInputClasses(surface.value, { tone: props.tone, size: props.size, invalid: !!props.error }),
);
const toggleLabel = computed(() => (visible.value ? props.toggleLabels[1] : props.toggleLabels[0]));

function onInput(event: Event) {
  setValue((event.target as HTMLInputElement).value);
}

function toggle() {
  if (!props.disabled) visible.value = !visible.value;
}

defineExpose({
  /** The native input. */
  element: input,
});
</script>

<template>
  <FieldShell :label="label" :hint="hint" :error="error" :surface="surface" :html-for="inputId">
    <span :class="classes.shell">
      <input
        :id="inputId"
        ref="input"
        :type="visible ? 'text' : 'password'"
        :aria-invalid="error ? true : undefined"
        :value="value"
        :disabled="disabled"
        :class="classes.input"
        v-bind="$attrs"
        @input="onInput"
      />
      <button
        type="button"
        tabindex="-1"
        :aria-label="toggleLabel"
        :aria-pressed="visible"
        :class="classes.toggle"
        :disabled="disabled"
        @click="toggle"
      >
        {{ toggleLabel }}
      </button>
    </span>
  </FieldShell>
</template>
