<script setup lang="ts">
import { computed, shallowRef, useTemplateRef, watch, type VNode } from 'vue';
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
 * and anchored below the root. Holds `PixelDropdownItem`s, checkbox and radio
 * items, headers and separators. Extra classes merge into the panel.
 */
defineSlots<{ default?(): VNode[] }>();

const context = useDropdownContext('PixelDropdownContent');
const panel = useTemplateRef<HTMLElement>('panel');
const position = shallowRef({ x: 0, y: 0 });
const classes = computed(() => dropdownContentClasses(context.surface.value));
const style = computed(() => floatingStyles(panel.value, position.value.x, position.value.y));

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
    ref="panel"
    :id="context.menuId"
    role="menu"
    aria-orientation="vertical"
    :style="style"
    :class="classes"
  >
    <slot />
  </div>
</template>
