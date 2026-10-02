<script setup lang="ts">
import { useControllableState } from '../composables/controllable.js';

/**
 * Unstyled `<textarea>` — the escape hatch for custom multi-line inputs
 * without the `PixelTextarea` chrome. The native textarea is the root element
 * (`$el`) and receives every attribute and listener. Bind its value with
 * `v-model`, or leave it uncontrolled with `default-value`.
 */
export interface PixelBareTextareaProps {
  /** Value (`v-model`); leave unset for an uncontrolled textarea. */
  modelValue?: string;
  /** Initial value while uncontrolled. */
  defaultValue?: string;
}

const props = withDefaults(defineProps<PixelBareTextareaProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
});

const emit = defineEmits<{
  /** The new value, on every edit. */
  'update:modelValue': [value: string];
}>();

const [value, setValue] = useControllableState<string | undefined>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue,
  onChange: (next) => emit('update:modelValue', next ?? ''),
});

function onInput(event: Event) {
  setValue((event.target as HTMLTextAreaElement).value);
}
</script>

<template>
  <textarea :value="value" @input="onInput" />
</template>
