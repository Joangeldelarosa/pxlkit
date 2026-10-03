<script setup lang="ts">
import { computed, onMounted, shallowRef, watch, type VNode } from 'vue';
import {
  isOtpComplete,
  otpCellLabel,
  otpCells,
  otpGroupLabel,
  otpInputClasses,
  otpInputMode,
  otpKeydown,
  otpPattern,
  pasteOtp,
  typeOtpCell,
  type OtpInputVariant,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * One-time passcode input: one cell per character, in a group named "One-time
 * passcode". Typing fills a cell and moves on, Backspace empties the cell or
 * goes back to empty the previous one, the arrows, Home and End move between
 * cells, and a paste fills the cells from the one pasted into. The first
 * cell offers the code a phone receives by SMS (`autocomplete="one-time-code"`).
 * Bind the code with `v-model`, or leave it uncontrolled with
 * `default-value`; with a `name` a hidden input submits it.
 */
export interface PixelOTPInputProps {
  /** Number of cells. */
  length?: number;
  /** Code (`v-model`); leave unset for an uncontrolled input. */
  modelValue?: string;
  /** Initial code while uncontrolled. */
  defaultValue?: string;
  /** Hides the characters, as a password field does. */
  mask?: boolean;
  /** Characters the cells accept: digits (`numeric`), or digits and letters (`alphanumeric`). */
  variant?: OtpInputVariant;
  /** @deprecated Use `variant`. */
  type?: OtpInputVariant;
  /** Focuses the first cell once mounted. */
  autoFocus?: boolean;
  /** Cell size. */
  size?: Size;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Form field name — a hidden input submits the code. */
  name?: string;
  /** Disables every cell. */
  disabled?: boolean;
}

const props = withDefaults(defineProps<PixelOTPInputProps>(), {
  length: 6,
  modelValue: undefined,
  defaultValue: undefined,
  mask: false,
  variant: undefined,
  type: undefined,
  autoFocus: false,
  size: 'md',
  surface: undefined,
  name: undefined,
  disabled: false,
});

const emit = defineEmits<{
  /** The new code, after every edit. */
  'update:modelValue': [value: string];
  /** The code, each time it comes to fill every cell. */
  complete: [value: string];
}>();

defineSlots<{
  /** Shown between two cells, hidden from assistive technology. */
  separator?(): VNode[];
}>();

const surface = useEffectiveSurface(() => props.surface);
const classes = computed(() => otpInputClasses(surface.value, props.size));
const variant = computed<OtpInputVariant>(() => props.variant ?? props.type ?? 'numeric');
const [value, setValue] = useControllableState({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? '',
  onChange: (next) => emit('update:modelValue', next),
});
const cells = computed(() => otpCells(value.value, props.length));

const cellElements: Array<HTMLInputElement | null> = [];
const first = shallowRef<HTMLInputElement | null>(null);
function setCell(index: number, element: unknown) {
  cellElements[index] = element as HTMLInputElement | null;
  if (index === 0) first.value = element as HTMLInputElement | null;
}

function focusCell(index: number) {
  const cell = cellElements[index];
  if (!cell) return;
  cell.focus();
  // A caret at the end, so the next key replaces the character cleanly.
  cell.setSelectionRange(cell.value.length, cell.value.length);
}

function onInput(index: number, event: Event) {
  const cell = event.target as HTMLInputElement;
  const edit = typeOtpCell(cells.value, index, cell.value, variant.value);
  setValue(edit.value);
  // The cell shows the code's character even when the code did not change,
  // as a controlled React input does: a rejected character goes away.
  cell.value = cells.value[index];
  if (edit.focus !== undefined) focusCell(edit.focus);
}

function onKeydown(index: number, event: KeyboardEvent) {
  const edit = otpKeydown(cells.value, index, event.key);
  if (!edit) return;
  event.preventDefault();
  if (edit.value !== undefined) setValue(edit.value);
  if (edit.focus !== undefined) focusCell(edit.focus);
}

function onPaste(index: number, event: ClipboardEvent) {
  event.preventDefault();
  const edit = pasteOtp(cells.value, index, event.clipboardData?.getData?.('text') ?? '', variant.value);
  if (!edit) return;
  setValue(edit.value);
  // Focus once the cells show the pasted code.
  requestAnimationFrame(() => focusCell(edit.focus));
}

function onFocus(event: FocusEvent) {
  // The cell's character is selected, so the next key replaces it.
  (event.target as HTMLInputElement).select();
}

let completed = false;
function checkComplete() {
  const full = isOtpComplete(value.value, props.length);
  if (full && !completed) emit('complete', value.value);
  completed = full;
}
watch([value, () => props.length], checkComplete, { flush: 'post' });
watch(
  () => props.autoFocus,
  (focus) => {
    if (focus) first.value?.focus();
  },
  { flush: 'post' },
);
onMounted(() => {
  checkComplete();
  if (props.autoFocus) first.value?.focus();
});

defineExpose({
  /** The first cell. */
  element: first,
});
</script>

<template>
  <div role="group" :aria-label="otpGroupLabel" :class="classes.root">
    <template v-for="(char, i) in cells" :key="i">
      <input
        :ref="(element) => setCell(i, element)"
        data-pxl-otp-cell="true"
        :data-pxl-otp-index="i"
        :type="mask ? 'password' : 'text'"
        :inputmode="otpInputMode(variant)"
        :pattern="otpPattern(variant)"
        :autocomplete="i === 0 ? 'one-time-code' : 'off'"
        maxlength="1"
        :disabled="disabled"
        :value="char"
        :aria-label="otpCellLabel(i, length)"
        :class="classes.cell"
        @input="onInput(i, $event)"
        @keydown="onKeydown(i, $event)"
        @paste="onPaste(i, $event)"
        @focus="onFocus"
      />
      <span v-if="$slots.separator && i < length - 1" aria-hidden="true" :class="classes.separator">
        <slot name="separator" />
      </span>
    </template>
    <input v-if="name" type="hidden" :name="name" :value="value" readonly />
  </div>
</template>
