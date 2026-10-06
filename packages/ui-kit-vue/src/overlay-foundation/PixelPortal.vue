<script setup lang="ts">
import { onBeforeUpdate, onMounted, onUpdated, ref, type VNode } from 'vue';
import { preserveFocus } from '@pxlkit/ui-kit-core';

/**
 * Renders its content into `container` (default `document.body`). On the
 * server and in the first client render the content stays in place, so the
 * server-rendered page and hydration agree; it moves once mounted, keeping
 * focus on an element inside it that already had it (a modal's focus trap).
 */
const props = defineProps<{
  /** Target element; `document.body` when left out. */
  container?: HTMLElement | null;
  /** Keep the content in place. */
  disabled?: boolean;
}>();
defineSlots<{
  /** Content to render in the target. */
  default?(): VNode[];
}>();

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

// Moving focused nodes drops their focus; put it back after each move.
let restoreFocus: (() => void) | null = null;
onBeforeUpdate(() => {
  restoreFocus = preserveFocus();
});
onUpdated(() => {
  restoreFocus?.();
  restoreFocus = null;
});
</script>

<template>
  <Teleport :to="props.container ?? 'body'" :disabled="props.disabled || !mounted">
    <slot />
  </Teleport>
</template>
