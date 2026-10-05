<script setup lang="ts">
import type { VNode } from 'vue';
import { cardFooterClasses } from '@pxlkit/ui-kit-core';

/** Footer part of a `PixelCard`, divided from the body and pushed to the bottom. */
defineSlots<{
  /** Footer content. */
  default?(): VNode[];
}>();
</script>

<template>
  <footer :class="cardFooterClasses"><slot /></footer>
</template>
