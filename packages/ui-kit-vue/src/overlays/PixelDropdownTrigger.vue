<script setup lang="ts">
import type { VNode } from 'vue';
import { dropdownChevronClasses, type Tone } from '@pxlkit/ui-kit-core';
import PixelGlyph from '../_internal/PixelGlyph.vue';
import PixelButton from '../actions/PixelButton.vue';
import { useDropdownContext } from './_internal/dropdown-context.js';

/**
 * The button that opens and closes the menu of a `PixelDropdownRoot`: a
 * `PixelButton` that advertises the menu (`aria-haspopup`, `aria-expanded`,
 * `aria-controls`) and ends with a chevron.
 */
const props = withDefaults(
  defineProps<{
    /** Button tone. */
    tone?: Tone;
    /** Disables the button. */
    disabled?: boolean;
    /** Accessible label, for a label that is only decorative. */
    ariaLabel?: string;
  }>(),
  { tone: 'neutral', disabled: false, ariaLabel: undefined },
);
defineSlots<{
  /** Button label. */
  default?(): VNode[];
  /** Icon at the end of the button, in place of the chevron. */
  icon?(): VNode[];
}>();

const context = useDropdownContext('PixelDropdownTrigger');

// A disabled button gets no clicks in a browser; synthetic ones are ignored too.
function toggle() {
  if (!props.disabled) context.setOpen(!context.open.value);
}
</script>

<template>
  <PixelButton
    :tone="tone"
    :surface="context.surface.value"
    :disabled="disabled"
    aria-haspopup="menu"
    :aria-expanded="context.open.value"
    :aria-controls="context.open.value ? context.menuId : undefined"
    :aria-label="ariaLabel"
    @click="toggle"
  >
    <slot />
    <template #icon-right>
      <slot name="icon"><PixelGlyph name="chevronDown" :class="dropdownChevronClasses(context.open.value)" /></slot>
    </template>
  </PixelButton>
</template>
