<script setup lang="ts">
import { provide, useId, type VNode } from 'vue';
import { formItemClasses, formItemIds } from '@pxlkit/ui-kit-core';
import { PIXEL_FORM_ITEM } from './_internal/form-context.js';

/**
 * One item of a `PixelForm`: the stack of a label, a control, a description
 * and a message, which it links with ids of its own — the label points at the
 * control, the control is described by the description and, while the field
 * shows an error, by the message. Attributes go to its `<div>`.
 */
defineSlots<{
  /** `PixelFormLabel`, `PixelFormControl`, `PixelFormDescription` and `PixelFormMessage`. */
  default?(): VNode[];
}>();

provide(PIXEL_FORM_ITEM, formItemIds(useId()));
</script>

<template>
  <div :class="formItemClasses"><slot /></div>
</template>
