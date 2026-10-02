<script setup lang="ts">
import { computed, useId, useTemplateRef, type VNode } from 'vue';
import {
  characterCountClasses,
  characterCountText,
  getStringLength,
  inputClasses,
  inputControlClasses,
  showCountMax,
  type ShowCount,
  type Size,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import FieldShell from '../_internal/FieldShell.vue';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';
import { Wrap } from './_internal/Wrap.js';

/**
 * Single-line text field with label, hint and error, tones, sizes and
 * surfaces, content inside its shell (`#prefix` / `#suffix`), addons joined
 * to its edges, a clear button, a character counter and a loading state.
 * Bind its value with `v-model` — clearing updates it too — or leave it
 * uncontrolled with `default-value`. Extra attributes and listeners go to the
 * `<input>`.
 */
export interface PixelInputProps {
  /** Value (`v-model`); leave unset for an uncontrolled input. */
  modelValue?: string | number;
  /** Initial value while uncontrolled. */
  defaultValue?: string | number;
  /** Label rendered above the input shell. */
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
  /** Shows a clear (×) button while the value is not empty. */
  clearable?: boolean;
  /** Character counter under the input: `true` shows `N`, `{ max }` shows `N/max` and caps the length. */
  showCount?: ShowCount;
  /** Replaces the suffix with a spinner and disables the input. */
  loading?: boolean;
  /** Disables the input. */
  disabled?: boolean;
  /** `id` of the input; generated when left out. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelInputProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  label: undefined,
  hint: undefined,
  error: undefined,
  tone: 'neutral',
  size: 'md',
  surface: undefined,
  clearable: false,
  showCount: false,
  loading: false,
  disabled: false,
  id: undefined,
});

const emit = defineEmits<{
  /** The new value, on every edit and when cleared. */
  'update:modelValue': [value: string];
  /** The clear button was pressed. */
  clear: [];
}>();

const slots = defineSlots<{
  /** Content inside the shell on the left (icon or short text). */
  prefix?(): VNode[];
  /** Legacy alias of `#prefix`. */
  icon?(): VNode[];
  /** Content inside the shell on the right; replaced by a spinner while `loading`. */
  suffix?(): VNode[];
  /** Element outside the shell, joined to its left edge. */
  'addon-left'?(): VNode[];
  /** Element outside the shell, joined to its right edge. */
  'addon-right'?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const generatedId = useId();
const inputId = computed(() => props.id ?? `pxl-input-${generatedId}`);
const input = useTemplateRef<HTMLInputElement>('input');

const [value, setValue] = useControllableState<string | number>({
  value: () => props.modelValue,
  defaultValue: () => (props.defaultValue !== undefined ? String(props.defaultValue) : ''),
  onChange: (next) => emit('update:modelValue', String(next)),
});

const length = computed(() => getStringLength(value.value));
const max = computed(() => showCountMax(props.showCount));
const showClear = computed(() => props.clearable && length.value > 0 && !props.disabled && !props.loading);
const classes = computed(() => inputClasses(surface.value, props.size));

// Slots are not reactive: whatever depends on which ones are filled is read
// while rendering.
const hasLeading = () => !!(slots.prefix ?? slots.icon);
function controlClasses() {
  return inputControlClasses(surface.value, {
    tone: props.tone,
    size: props.size,
    invalid: !!props.error,
    leading: hasLeading(),
    trailing: props.loading || !!slots.suffix,
    clearButton: showClear.value,
    addonLeft: !!slots['addon-left'],
    addonRight: !!slots['addon-right'],
  });
}

function onInput(event: Event) {
  setValue((event.target as HTMLInputElement).value);
}

function clear() {
  setValue('');
  emit('clear');
}

defineExpose({
  /** The native input. */
  element: input,
});
</script>

<template>
  <FieldShell :label="label" :hint="hint" :error="error" :surface="surface" :html-for="inputId">
    <Wrap :tag="$slots['addon-left'] || $slots['addon-right'] ? 'span' : undefined" :class="classes.addons">
      <span v-if="$slots['addon-left']" :class="classes.addonLeft"><slot name="addon-left" /></span>
      <span :class="classes.shell">
        <span v-if="hasLeading()" :class="classes.leading">
          <slot name="prefix"><slot name="icon" /></slot>
        </span>
        <input
          :id="inputId"
          ref="input"
          :aria-invalid="error ? true : undefined"
          :aria-describedby="error || hint ? `${inputId}-msg` : undefined"
          :value="value"
          :disabled="disabled || loading"
          :maxlength="max"
          :class="controlClasses()"
          v-bind="$attrs"
          @input="onInput"
        />
        <span v-if="showClear || loading || $slots.suffix" :class="classes.trailing">
          <button
            v-if="showClear"
            type="button"
            tabindex="-1"
            aria-label="Clear input"
            :class="classes.clearButton"
            @click="clear"
          >
            <PixelGlyph name="close" :class="classes.clearIcon" />
          </button>
          <span v-if="loading || $slots.suffix" :class="classes.suffix">
            <span v-if="loading" aria-hidden="true" :class="classes.spinner" />
            <slot v-else name="suffix" />
          </span>
        </span>
      </span>
      <span v-if="$slots['addon-right']" :class="classes.addonRight"><slot name="addon-right" /></span>
    </Wrap>
    <span v-if="showCount" aria-live="polite" :class="characterCountClasses(surface, length, max)">
      {{ characterCountText(length, max) }}
    </span>
  </FieldShell>
</template>
