<script setup lang="ts">
import { computed } from 'vue';
import { popoverArrowClasses } from '@pxlkit/ui-kit-core';
import { usePopoverContext } from './_internal/popover-context.js';

/** Decorative arrow inside `PixelPopoverContent`, pointing back at the trigger. */
const context = usePopoverContext('PixelPopoverArrow');
const classes = computed(() => popoverArrowClasses(context.surface.value, context.side.value));
</script>

<template>
  <span aria-hidden="true" :class="classes" />
</template>
