<script setup lang="ts">
import type { VNode } from 'vue';

/**
 * Unstyled `<button>` for composing your own: it adds no classes, and every
 * attribute and listener falls through to it. Its `type` defaults to
 * `"button"`, so it never submits a form by accident.
 */
export interface PixelBareButtonProps {
  /** Native `type`; `button` unless set. */
  type?: 'button' | 'submit' | 'reset';
}

withDefaults(defineProps<PixelBareButtonProps>(), { type: 'button' });
defineSlots<{ default?(): VNode[] }>();
</script>

<template>
  <button :type="type"><slot /></button>
</template>
