<script setup lang="ts">
import { computed, shallowRef, watch, type ComponentPublicInstance, type VNode } from 'vue';
import {
  DROPDOWN_PLACEMENT,
  anchorFloating,
  dropdownContentClasses,
  dropdownMiddleware,
  floatingStyles,
} from '@pxlkit/ui-kit-core';
import { useDropdownContext } from './_internal/dropdown-context.js';

/**
 * The menu of a `PixelDropdownRoot` (`role="menu"`), rendered while it is open
 * and anchored below the root. It takes focus as it opens and handles the
 * keys while open. Holds `PixelDropdownItem`s, checkbox and radio items,
 * headers and separators. Extra classes merge into the panel.
 */
defineSlots<{
  /** The items. */
  default?(): VNode[];
}>();

const context = useDropdownContext('PixelDropdownContent');
const panel = shallowRef<HTMLElement | null>(null);
const position = shallowRef({ x: 0, y: 0 });
const classes = computed(() => dropdownContentClasses(context.surface.value));
const style = computed(() => floatingStyles(panel.value, position.value.x, position.value.y));

// Function ref: called with null right before the menu leaves the page.
function setPanel(target: Element | ComponentPublicInstance | null) {
  panel.value = target instanceof HTMLElement ? target : null;
  context.setMenu(panel.value);
}

// Keep the menu anchored to the root while it is open.
watch([context.root, panel], ([reference, floating], _previous, onCleanup) => {
  if (!reference || !floating) return;
  onCleanup(
    anchorFloating(reference, floating, { placement: DROPDOWN_PLACEMENT, middleware: dropdownMiddleware() }, ({ x, y }) => {
      position.value = { x, y };
    }),
  );
});
</script>

<template>
  <div
    v-if="context.open.value"
    :ref="setPanel"
    :id="context.menuId"
    role="menu"
    tabindex="-1"
    aria-orientation="vertical"
    :aria-labelledby="context.triggerId.value"
    :aria-activedescendant="context.activeId.value"
    :style="style"
    :class="classes"
    @keydown="context.onMenuKeydown"
  >
    <slot />
  </div>
</template>
