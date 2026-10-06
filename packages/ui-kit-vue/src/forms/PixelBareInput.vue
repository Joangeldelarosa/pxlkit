<script setup lang="ts">
import { useControllableState } from '../composables/controllable.js';

/**
 * Unstyled `<input>` — the escape hatch for fully custom field compositions.
 * The native input is the root element (`$el`) and receives every attribute
 * and listener. Bind its value with `v-model`, or leave it uncontrolled with
 * `default-value`.
 */
export interface PixelBareInputProps {
  /** Value (`v-model`); leave unset for an uncontrolled input. */
  modelValue?: string | number;
  /** Initial value while uncontrolled. */
  defaultValue?: string | number;
}

const props = withDefaults(defineProps<PixelBareInputProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
});

const emit = defineEmits<{
  /** The new value, on every edit. */
  'update:modelValue': [value: string];
}>();

const [value, setValue] = useControllableState<string | number | undefined>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue,
  onChange: (next) => emit('update:modelValue', String(next)),
});

function onInput(event: Event) {
  setValue((event.target as HTMLInputElement).value);
}
</script>

<template>
  <input :value="value" @input="onInput" />
</template>
