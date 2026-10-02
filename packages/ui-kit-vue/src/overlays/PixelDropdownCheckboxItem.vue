<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { dropdownItemRoles, dropdownMark, dropdownMarkClasses } from '@pxlkit/ui-kit-core';
import type { PixelDropdownItemProps } from './_internal/dropdown-context.js';
import PixelDropdownItem from './PixelDropdownItem.vue';

/**
 * A `PixelDropdownItem` (`role="menuitemcheckbox"`) that shows a check mark
 * while `checked`. The state is display-only: update it from `select`.
 */
export interface PixelDropdownCheckboxItemProps extends PixelDropdownItemProps {
  /** Shows the check mark, and sets `aria-checked`. */
  checked?: boolean;
}

const props = withDefaults(defineProps<PixelDropdownCheckboxItemProps>(), {
  value: undefined,
  disabled: false,
  destructive: false,
  tone: undefined,
  shortcut: undefined,
  checked: false,
});
const emit = defineEmits<{
  /** The item was chosen; the menu closes. */
  select: [];
}>();
defineSlots<{ default?(): VNode[] }>();

const itemProps = computed(() => {
  const { checked: _checked, ...rest } = props;
  return rest;
});
</script>

<template>
  <PixelDropdownItem v-bind="itemProps" :role="dropdownItemRoles.checkbox" :aria-checked="checked" @select="emit('select')">
    <template #icon>
      <span aria-hidden="true" :class="dropdownMarkClasses">{{ dropdownMark('checkbox', checked) }}</span>
    </template>
    <slot />
  </PixelDropdownItem>
</template>
