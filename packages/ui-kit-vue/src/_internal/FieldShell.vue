<script setup lang="ts">
import { computed, type VNode } from 'vue';
import { fieldShellClasses, fieldShellTextClasses, type Surface } from '@pxlkit/ui-kit-core';
import { useEffectiveSurface } from '../composables/surface.js';

/**
 * Label, control and hint / error stacked the way every form field of the kit
 * lays them out.
 */
const props = defineProps<{
  label?: string;
  hint?: string;
  error?: string;
  surface?: Surface;
  /**
   * Id of the field's primary control. When provided, the label text is a
   * real `<label for>`; without it the text renders as a plain span.
   */
  htmlFor?: string;
  /**
   * Id of the hint / error text, for the control's `aria-describedby`
   * (`fieldMessageId` / `fieldDescribedBy` from the core).
   */
  messageId?: string;
}>();
defineSlots<{ default?(): VNode[] }>();

const surface = useEffectiveSurface(() => props.surface);
// NOT a wrapping <label>: native label activation forwards clicks to the
// contained control, which double-fires fields whose children also trigger
// it programmatically. An explicit `for` keeps a single association.
const text = computed(() => fieldShellTextClasses(surface.value));
</script>

<template>
  <div :class="fieldShellClasses">
    <template v-if="label">
      <label v-if="htmlFor" :for="htmlFor" :class="text.label">{{ label }}</label>
      <span v-else :class="text.label">{{ label }}</span>
    </template>
    <slot />
    <span v-if="error" :id="messageId" :class="text.error">{{ error }}</span>
    <span v-else-if="hint" :id="messageId" :class="text.hint">{{ hint }}</span>
  </div>
</template>
