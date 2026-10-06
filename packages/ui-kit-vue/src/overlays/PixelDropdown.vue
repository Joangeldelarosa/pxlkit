<script setup lang="ts">
import { h, type VNode } from 'vue';
import type { DropdownItemKind, Surface, Tone } from '@pxlkit/ui-kit-core';
import { RenderNode, type PxlNode } from '../_internal/render-node.js';
import PixelDropdownCheckboxItem from './PixelDropdownCheckboxItem.vue';
import PixelDropdownContent from './PixelDropdownContent.vue';
import PixelDropdownHeader from './PixelDropdownHeader.vue';
import PixelDropdownItem from './PixelDropdownItem.vue';
import PixelDropdownRadioItem from './PixelDropdownRadioItem.vue';
import PixelDropdownRoot from './PixelDropdownRoot.vue';
import PixelDropdownSeparator from './PixelDropdownSeparator.vue';
import PixelDropdownTrigger from './PixelDropdownTrigger.vue';

/** A row of the `items` shorthand: an item (the default kind), a separator, a header, … */
export interface DropdownOption {
  value: string;
  label: string;
  icon?: PxlNode;
  disabled?: boolean;
  tone?: Tone;
  kind?: DropdownItemKind;
  /** Keyboard hint shown at the end of the row (display only). */
  shortcut?: string;
  /** For `checkbox` and `radio` rows: the mark shown (display only). */
  checked?: boolean;
}

/**
 * A button that opens a menu of actions, keyboard navigable (arrows, Home /
 * End, Enter / Space, typeahead, Escape). Pass `items` and `label` for the
 * shorthand and listen to `select`, or compose `PixelDropdownTrigger`,
 * `PixelDropdownContent` and items in the default slot; for a controlled
 * menu use `PixelDropdownRoot`.
 *
 * @example
 * <PixelDropdown label="Actions" :items="[{ value: 'edit', label: 'Edit' }]" @select="run" />
 */
export interface PixelDropdownProps {
  /** Trigger label of the shorthand. */
  label?: string;
  /** Rows of the shorthand. */
  items?: DropdownOption[];
  /** Trigger tone. */
  tone?: Tone;
  /** Disables the trigger. */
  disabled?: boolean;
  /** Surface override; defaults to the nearest provider. */
  surface?: Surface;
  /** Accessible label of the trigger, for a label that is only decorative. */
  ariaLabel?: string;
}

withDefaults(defineProps<PixelDropdownProps>(), {
  label: undefined,
  items: undefined,
  tone: 'neutral',
  disabled: false,
  surface: undefined,
  ariaLabel: undefined,
});
const emit = defineEmits<{
  /** The `value` of the row chosen from the shorthand. */
  select: [value: string];
}>();
defineSlots<{
  /** Trigger, content and items, in place of the shorthand. */
  default?(): VNode[];
  /** Icon at the end of the shorthand's trigger, in place of the chevron. */
  icon?(): VNode[];
}>();

const submenuArrow = () => h('span', { 'aria-hidden': 'true' }, '▸');
// What a row shows before its label: its icon, else the submenu arrow.
const iconOf = (item: DropdownOption) => item.icon ?? (item.kind === 'submenu' ? submenuArrow : undefined);
</script>

<template>
  <PixelDropdownRoot :surface="surface">
    <div class="contents">
      <slot v-if="$slots.default" />
      <template v-else>
        <PixelDropdownTrigger :tone="tone" :disabled="disabled" :aria-label="ariaLabel">
          {{ label }}
          <template v-if="$slots.icon" #icon><slot name="icon" /></template>
        </PixelDropdownTrigger>
        <PixelDropdownContent>
          <template v-for="(item, index) in items ?? []" :key="`${item.kind ?? 'item'}-${index}-${item.value}`">
            <PixelDropdownSeparator v-if="item.kind === 'separator'" />
            <PixelDropdownHeader v-else-if="item.kind === 'header'">{{ item.label }}</PixelDropdownHeader>
            <PixelDropdownCheckboxItem
              v-else-if="item.kind === 'checkbox'"
              :value="item.value"
              :disabled="item.disabled"
              :tone="item.tone"
              :shortcut="item.shortcut"
              :checked="item.checked"
              @select="emit('select', item.value)"
            >
              {{ item.label }}
            </PixelDropdownCheckboxItem>
            <PixelDropdownRadioItem
              v-else-if="item.kind === 'radio'"
              :value="item.value"
              :disabled="item.disabled"
              :tone="item.tone"
              :shortcut="item.shortcut"
              :checked="item.checked"
              @select="emit('select', item.value)"
            >
              {{ item.label }}
            </PixelDropdownRadioItem>
            <PixelDropdownItem
              v-else
              :value="item.value"
              :disabled="item.disabled"
              :tone="item.tone"
              :shortcut="item.shortcut"
              @select="emit('select', item.value)"
            >
              <template v-if="iconOf(item)" #icon><RenderNode :node="iconOf(item)" /></template>
              {{ item.label }}
            </PixelDropdownItem>
          </template>
        </PixelDropdownContent>
      </template>
    </div>
  </PixelDropdownRoot>
</template>
