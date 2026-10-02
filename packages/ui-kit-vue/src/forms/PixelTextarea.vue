<script setup lang="ts">
import { computed, onMounted, useId, useTemplateRef, watch } from 'vue';
import {
  autosizeTextarea,
  characterCountClasses,
  characterCountText,
  getStringLength,
  showCountMax,
  textareaClasses,
  type ShowCount,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import FieldShell from '../_internal/FieldShell.vue';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Multi-line text field with label, hint and error, tones and surfaces, an
 * optional auto-grow between `min-rows` and `max-rows`, and a character
 * counter. Bind its value with `v-model`, or leave it uncontrolled with
 * `default-value`. Extra attributes and listeners go to the `<textarea>`.
 */
export interface PixelTextareaProps {
  /** Value (`v-model`); leave unset for an uncontrolled textarea. */
  modelValue?: string;
  /** Initial value while uncontrolled. */
  defaultValue?: string;
  /** Label rendered above the textarea. */
  label?: string;
  /** Helper text below the field; hidden while `error` is set. */
  hint?: string;
  /** Error message below the field; marks the textarea invalid. */
  error?: string;
  /** Tone of the focus ring. */
  tone?: Tone;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Grows with the content, between `minRows` and `maxRows` lines. */
  autosize?: boolean;
  /** Lines shown at least while `autosize` is on. */
  minRows?: number;
  /** Lines shown at most while `autosize` is on; it scrolls past them. */
  maxRows?: number;
  /** Character counter under the textarea: `true` shows `N`, `{ max }` shows `N/max` and caps the length. */
  showCount?: ShowCount;
  /** `id` of the textarea; generated when left out. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelTextareaProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  label: undefined,
  hint: undefined,
  error: undefined,
  tone: 'neutral',
  surface: undefined,
  autosize: false,
  minRows: 3,
  maxRows: undefined,
  showCount: false,
  id: undefined,
});

const emit = defineEmits<{
  /** The new value, on every edit. */
  'update:modelValue': [value: string];
}>();

const surface = useEffectiveSurface(() => props.surface);
const generatedId = useId();
const textareaId = computed(() => props.id ?? `pxl-textarea-${generatedId}`);
const textarea = useTemplateRef<HTMLTextAreaElement>('textarea');

const [value, setValue] = useControllableState<string>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? '',
  onChange: (next) => emit('update:modelValue', next),
});

const length = computed(() => getStringLength(value.value));
const max = computed(() => showCountMax(props.showCount));
const classes = computed(() =>
  textareaClasses(surface.value, { tone: props.tone, invalid: !!props.error, autosize: props.autosize }),
);

function resize() {
  if (textarea.value && props.autosize) autosizeTextarea(textarea.value, props.minRows, props.maxRows);
}

onMounted(resize);
watch([value, () => props.autosize, () => props.minRows, () => props.maxRows], resize, { flush: 'post' });

function onInput(event: Event) {
  setValue((event.target as HTMLTextAreaElement).value);
  // A controlled value its parent keeps as is leaves the typed text in place:
  // fit that too, once it has rendered.
  if (props.autosize) requestAnimationFrame(resize);
}

defineExpose({
  /** The native textarea. */
  element: textarea,
});
</script>

<template>
  <FieldShell :label="label" :hint="hint" :error="error" :surface="surface" :html-for="textareaId">
    <textarea
      :id="textareaId"
      ref="textarea"
      :aria-invalid="error ? true : undefined"
      :value="value"
      :rows="autosize ? minRows : undefined"
      :maxlength="max"
      :class="classes"
      v-bind="$attrs"
      @input="onInput"
    />
    <span v-if="showCount" aria-live="polite" :class="characterCountClasses(surface, length, max)">
      {{ characterCountText(length, max) }}
    </span>
  </FieldShell>
</template>
