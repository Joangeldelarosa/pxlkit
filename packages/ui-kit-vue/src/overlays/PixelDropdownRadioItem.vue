<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { dropdownItemRoles, dropdownMark, dropdownMarkClasses } from '@pxlkit/ui-kit-core';
import type { PixelDropdownItemProps } from './_internal/dropdown-context.js';
import PixelDropdownItem from './PixelDropdownItem.vue';

/**
 * A `PixelDropdownItem` (`role="menuitemradio"`) that shows a dot while
 * `checked`, one of a set. The state is display-only: update it from `select`.
 */
export interface PixelDropdownRadioItemProps extends PixelDropdownItemProps {
  /** Shows the dot, and sets `aria-checked`. */
  checked?: boolean;
}

const props = withDefaults(defineProps<PixelDropdownRadioItemProps>(), {
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
  <PixelDropdownItem v-bind="itemProps" :role="dropdownItemRoles.radio" :aria-checked="checked" @select="emit('select')">
    <template #icon>
      <span aria-hidden="true" :class="dropdownMarkClasses">{{ dropdownMark('radio', checked) }}</span>
    </template>
    <slot />
  </PixelDropdownItem>
</template>
