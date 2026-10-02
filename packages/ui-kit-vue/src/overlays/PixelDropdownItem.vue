<script setup lang="ts">
import { computed, onBeforeUnmount, useId, useTemplateRef, type VNode } from 'vue';
import {
  dropdownItemClasses,
  dropdownItemIconClasses,
  dropdownItemLabelClasses,
  dropdownShortcutClasses,
} from '@pxlkit/ui-kit-core';
import { labelText, useDropdownContext, type PixelDropdownItemProps } from './_internal/dropdown-context.js';

/**
 * An action of the menu (`role="menuitem"`), on a `<button>` that every
 * other attribute and listener falls through to. Clicking it, or Enter /
 * Space while it is highlighted, emits `select` and closes the menu; the
 * pointer highlights it. A disabled item is skipped by the keyboard.
 */
const props = withDefaults(defineProps<PixelDropdownItemProps>(), {
  value: undefined,
  disabled: false,
  destructive: false,
  tone: undefined,
  shortcut: undefined,
});
const emit = defineEmits<{
  /** The item was chosen; the menu closes. */
  select: [];
}>();
defineSlots<{
  /** Label. */
  default?(): VNode[];
  /** Icon before the label. */
  icon?(): VNode[];
}>();

const context = useDropdownContext('PixelDropdownItem');
const generatedValue = useId();
const value = () => props.value ?? generatedValue;
const label = useTemplateRef<HTMLElement>('label');
const highlighted = computed(() => context.highlighted.value === value());
const classes = computed(() =>
  dropdownItemClasses(context.surface.value, {
    highlighted: highlighted.value,
    disabled: props.disabled,
    tone: props.destructive ? 'red' : props.tone,
  }),
);

function select() {
  if (!props.disabled) emit('select');
}

onBeforeUnmount(
  context.registerItem({ value, disabled: () => props.disabled, label: () => labelText(label.value), select }),
);

// A disabled button gets no pointer events in a browser; synthetic ones are ignored too.
function onMouseenter() {
  if (!props.disabled) context.highlight(value());
}

function onClick() {
  if (props.disabled) return;
  select();
  context.setOpen(false);
}
</script>

<template>
  <button
    type="button"
    role="menuitem"
    tabindex="-1"
    :aria-disabled="disabled || undefined"
    :data-highlighted="highlighted || undefined"
    :disabled="disabled"
    :class="classes"
    @mouseenter="onMouseenter"
    @click="onClick"
  >
    <span v-if="$slots.icon" :class="dropdownItemIconClasses"><slot name="icon" /></span>
    <span ref="label" :class="dropdownItemLabelClasses"><slot /></span>
    <kbd v-if="shortcut" data-testid="dropdown-shortcut" :class="dropdownShortcutClasses(context.surface.value)">{{
      shortcut
    }}</kbd>
  </button>
</template>
