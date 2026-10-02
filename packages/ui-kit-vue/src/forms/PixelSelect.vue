<script setup lang="ts">
import { computed, ref, useId, useTemplateRef } from 'vue';
import {
  selectClasses,
  selectKeydown,
  selectListboxId,
  selectOptionClasses,
  selectOptionId,
  type Size,
  type Surface,
  type Tone,
} from '@pxlkit/ui-kit-core';
import FieldShell from '../_internal/FieldShell.vue';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import { RenderNode } from '../_internal/render-node.js';
import { useControllableState } from '../composables/controllable.js';
import { useClickOutside } from '../composables/overlay.js';
import { useEffectiveSurface } from '../composables/surface.js';
import type { Option } from './_internal/option.js';

/**
 * Custom single-value dropdown: a `role="combobox"` trigger over a listbox,
 * with ArrowUp / ArrowDown, Home / End, Enter / Space, Escape and Tab, and a
 * press outside to close. Bind the value with `v-model`, or leave it
 * uncontrolled with `default-value`. With a `name` a hidden input submits the
 * value in forms. Extra attributes and listeners go to the trigger
 * `<button>`.
 */
export interface PixelSelectProps {
  /** Label rendered above the trigger. */
  label?: string;
  /** The options of the listbox; an option's `icon` shows before its label. */
  options: Option[];
  /** Selected value (`v-model`); leave unset for an uncontrolled select. */
  modelValue?: string;
  /** Initial value while uncontrolled. */
  defaultValue?: string;
  /** Text shown while nothing is selected. */
  placeholder?: string;
  /** Helper text below the field; hidden while `error` is set. */
  hint?: string;
  /** Error message below the field; marks the trigger invalid. */
  error?: string;
  /** Disables the select and greys out the trigger. */
  disabled?: boolean;
  /** Tone of the focus ring and the selected option. */
  tone?: Tone;
  /** Trigger height. */
  size?: Size;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Form field name — a hidden input submits the value. */
  name?: string;
  /** Marks the field as required for native form validation. */
  required?: boolean;
  /** `id` of the trigger; generated when left out. */
  id?: string;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PixelSelectProps>(), {
  label: undefined,
  modelValue: undefined,
  defaultValue: undefined,
  placeholder: 'Select...',
  hint: undefined,
  error: undefined,
  disabled: false,
  tone: 'neutral',
  size: 'md',
  surface: undefined,
  name: undefined,
  required: false,
  id: undefined,
});

const emit = defineEmits<{
  /** The value of the option the user picked. */
  'update:modelValue': [value: string];
}>();

const surface = useEffectiveSurface(() => props.surface);
const generatedId = useId();
const triggerId = computed(() => props.id ?? `pxl-select-${generatedId}`);
const container = useTemplateRef<HTMLDivElement>('container');
const trigger = useTemplateRef<HTMLButtonElement>('trigger');
const open = ref(false);
const highlighted = ref(-1);

const [value, setValue] = useControllableState<string>({
  value: () => props.modelValue,
  defaultValue: () => props.defaultValue ?? '',
  onChange: (next) => emit('update:modelValue', next),
});

const selected = computed(() => props.options.find((option) => option.value === value.value));
const classes = computed(() =>
  selectClasses(surface.value, {
    tone: props.tone,
    size: props.size,
    invalid: !!props.error,
    disabled: props.disabled,
    open: open.value,
    hasValue: !!selected.value,
  }),
);
// Focus stays on the trigger: it points at the open listbox and at the
// highlighted option, so screen readers follow the arrow keys.
const listboxId = computed(() => selectListboxId(triggerId.value));
const activeOptionId = computed(() =>
  open.value && props.options[highlighted.value] ? selectOptionId(triggerId.value, highlighted.value) : undefined,
);
const items = computed(() =>
  props.options.map((option, index) => {
    const isSelected = option.value === value.value;
    return {
      option,
      id: selectOptionId(triggerId.value, index),
      selected: isSelected,
      class: selectOptionClasses(surface.value, {
        tone: props.tone,
        selected: isSelected,
        highlighted: index === highlighted.value,
      }),
    };
  }),
);

useClickOutside(container, () => {
  open.value = false;
});

function choose(next: string) {
  setValue(next);
  open.value = false;
}

function toggle() {
  if (!props.disabled) open.value = !open.value;
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  const next = selectKeydown(event.key, { open: open.value, highlighted: highlighted.value }, props.options.length);
  if (!next) return;
  // Tab keeps its default, so focus moves on as the listbox closes.
  if (next.preventDefault) event.preventDefault();
  if (next.select !== undefined) {
    choose(props.options[next.select]!.value);
    return;
  }
  open.value = next.open;
  highlighted.value = next.highlighted;
}

defineExpose({
  /** The combobox trigger. */
  element: trigger,
});
</script>

<template>
  <FieldShell :label="label" :hint="hint" :error="error" :surface="surface" :html-for="triggerId">
    <div ref="container" :class="classes.container">
      <input v-if="name" type="hidden" :name="name" :value="value" :required="required" />
      <button
        v-bind="$attrs"
        :id="triggerId"
        ref="trigger"
        type="button"
        role="combobox"
        :aria-expanded="open"
        aria-haspopup="listbox"
        :aria-controls="open ? listboxId : undefined"
        :aria-activedescendant="activeOptionId"
        :aria-disabled="disabled"
        :aria-required="required || undefined"
        :aria-invalid="error ? true : undefined"
        :disabled="disabled"
        :class="classes.trigger"
        @click="toggle"
        @keydown="onKeydown"
      >
        <span :class="classes.triggerContent">
          <span v-if="selected?.icon" :class="classes.icon"><RenderNode :node="selected.icon" /></span>
          <span :class="classes.value">{{ selected?.label ?? placeholder }}</span>
        </span>
        <PixelGlyph name="chevronDown" :class="classes.chevron" />
      </button>
      <div v-if="open" :id="listboxId" role="listbox" :class="classes.listbox">
        <button
          v-for="(item, index) in items"
          :id="item.id"
          :key="item.option.value"
          type="button"
          role="option"
          :aria-selected="item.selected"
          :class="item.class"
          @mouseenter="highlighted = index"
          @click="choose(item.option.value)"
        >
          <span :class="classes.optionContent">
            <span v-if="item.option.icon" :class="classes.icon"><RenderNode :node="item.option.icon" /></span>
            <span :class="classes.optionLabel">{{ item.option.label }}</span>
          </span>
          <PixelGlyph v-if="item.selected" name="check" :class="classes.check" />
        </button>
      </div>
    </div>
  </FieldShell>
</template>
