<script setup lang="ts">
import { computed, ref, useAttrs, useId, useTemplateRef, watch } from 'vue';
import {
  DEFAULT_COLOR_PRESETS,
  colorInputClasses,
  colorInputValue,
  colorPresetClasses,
  colorPresetKeydown,
  colorSwatchHex,
  fieldDescribedBy,
  fieldMessageId,
  isColorPresetSelected,
  normalizeHex,
  type ColorFormat,
  type Size,
  type Surface,
} from '@pxlkit/ui-kit-core';
import FieldShell from '../_internal/FieldShell.vue';
import { useControllableState } from '../composables/controllable.js';
import { useEffectiveSurface } from '../composables/surface.js';
import PixelPopover from '../overlay-foundation/PixelPopover.vue';
import PixelPopoverContent from '../overlay-foundation/PixelPopoverContent.vue';
import PixelPopoverTrigger from '../overlay-foundation/PixelPopoverTrigger.js';

/**
 * Colour field: a trigger that shows the colour and opens a popover dialog
 * with the browser's colour picker, a hex field and a grid of presets (eight
 * to a row, the arrows, Home / End and Enter / Space move through and pick
 * them). Focus moves into the dialog as it opens. A colour picked or typed
 * in full is written in `format`; a partial hex stays in the field until it
 * is complete. Bind the value with `v-model`, or leave it uncontrolled with
 * `default-value`; with a `name` a hidden input submits it. Extra attributes
 * and listeners go to the trigger.
 *
 * @example
 * <PixelColorInput v-model="brand" label="Brand color" format="rgb" />
 */
export interface PixelColorInputProps {
  /** The colour (`v-model`); leave unset for an uncontrolled input. */
  modelValue?: string;
  /** Initial colour while uncontrolled. */
  defaultValue?: string;
  /** How a picked colour is written: `#rrggbb`, `rgb(r, g, b)` or `hsl(h, s%, l%)`. */
  format?: ColorFormat;
  /** The preset colours; sixteen greys and hues by default. */
  presets?: string[];
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Trigger height. */
  size?: Size;
  /** Label rendered above the trigger, which it also names. */
  label?: string;
  /** Helper text below the field; hidden while `error` is set. */
  hint?: string;
  /** Error message below the field; marks the trigger invalid. */
  error?: string;
  /** Form field name — a hidden input submits the colour. */
  name?: string;
  /** `id` of the trigger; generated when left out. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelColorInputProps>(), {
  modelValue: undefined,
  defaultValue: undefined,
  format: 'hex',
  presets: undefined,
  surface: undefined,
  size: 'md',
  label: undefined,
  hint: undefined,
  error: undefined,
  name: undefined,
  id: undefined,
});

const emit = defineEmits<{
  /** The colour picked or typed, in `format`. */
  'update:modelValue': [value: string];
}>();

const surface = useEffectiveSurface(() => props.surface);
const generatedId = useId();
const inputId = computed(() => props.id ?? `pxl-color-${generatedId}`);
const hexInputId = `${generatedId}-hex`;
const attrs = useAttrs();
// Attributes are not reactive: the consumer's `aria-describedby` is read while
// rendering, and the hint / error is added to it while one shows.
const describedBy = () =>
  fieldDescribedBy(inputId.value, props, attrs['aria-describedby'] as string | undefined);
const trigger = useTemplateRef<HTMLButtonElement>('trigger');
const native = useTemplateRef<HTMLInputElement>('native');
const swatches = useTemplateRef<HTMLElement>('swatches');

const [value, setValue] = useControllableState<string>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? '',
  onChange: (next) => emit('update:modelValue', next),
});

const open = ref(false);
const palette = computed(() => props.presets ?? DEFAULT_COLOR_PRESETS);
const swatchHex = computed(() => colorSwatchHex(value.value));
const classes = computed(() =>
  colorInputClasses(surface.value, { size: props.size, invalid: !!props.error, hasValue: !!value.value }),
);
// Roving tabindex over the presets.
const focusedSwatch = ref(0);

// A draft for the hex field, so partial keystrokes do not leak out as
// values; it follows the value whenever that changes.
const draftHex = ref(value.value);
watch(value, (next) => {
  draftHex.value = next;
});

// Focus moves into the dialog as it opens, to its first field.
watch(native, (element) => element?.focus(), { flush: 'post' });

function commit(color: string) {
  setValue(colorInputValue(color, props.format));
}

function onHexInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  draftHex.value = raw;
  // Only a complete colour is committed; a partial one stays in the field.
  const hex = normalizeHex(raw);
  if (hex) commit(hex);
}

function onSwatchKeydown(event: KeyboardEvent, index: number) {
  const action = colorPresetKeydown(event.key, index, palette.value.length);
  if (!action) return;
  event.preventDefault();
  if ('select' in action) {
    commit(palette.value[index]!);
    return;
  }
  focusedSwatch.value = action.focus;
  (swatches.value?.children[action.focus] as HTMLElement | undefined)?.focus();
}

function onSwatchClick(index: number) {
  focusedSwatch.value = index;
  commit(palette.value[index]!);
}

defineExpose({
  /** The trigger button. */
  element: trigger,
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
    <span :class="classes.anchor">
      <PixelPopover
        v-model:open="open"
        side="bottom"
        align="start"
        :side-offset="4"
        :surface="surface"
        haspopup="dialog"
        role="dialog"
      >
        <PixelPopoverTrigger>
          <button
            v-bind="$attrs"
            :id="inputId"
            ref="trigger"
            type="button"
            :aria-label="label ?? 'Color'"
            :aria-invalid="error ? true : undefined"
            :aria-describedby="describedBy()"
            :class="classes.trigger"
          >
            <span aria-hidden="true" :class="classes.sample" :style="{ backgroundColor: swatchHex }" />
            <span :class="classes.value">{{ value || 'Pick a color' }}</span>
          </button>
        </PixelPopoverTrigger>
        <PixelPopoverContent aria-label="Color picker" :class="classes.content">
          <div :class="classes.pickers">
            <input
              ref="native"
              type="color"
              aria-label="Native color picker"
              :value="swatchHex"
              :class="classes.native"
              @input="commit(($event.target as HTMLInputElement).value)"
            />
            <label :for="hexInputId" :class="classes.hexLabel">Hex</label>
            <input
              :id="hexInputId"
              type="text"
              aria-label="Hex value"
              placeholder="#000000"
              :value="draftHex"
              :class="classes.hex"
              @input="onHexInput"
              @blur="draftHex = value"
            />
          </div>
          <div ref="swatches" role="group" aria-label="Color presets" :class="classes.presets">
            <button
              v-for="(hex, index) in palette"
              :key="hex"
              type="button"
              :aria-pressed="isColorPresetSelected(hex, swatchHex)"
              :aria-label="hex"
              :tabindex="focusedSwatch === index ? 0 : -1"
              :class="colorPresetClasses(surface, isColorPresetSelected(hex, swatchHex))"
              :style="{ backgroundColor: hex }"
              @click="onSwatchClick(index)"
              @focus="focusedSwatch = index"
              @keydown="onSwatchKeydown($event, index)"
            />
          </div>
        </PixelPopoverContent>
      </PixelPopover>
      <input v-if="name" type="hidden" :name="name" :value="value" readonly />
    </span>
  </FieldShell>
</template>
