<script setup lang="ts">
import type { VNode } from 'vue';
import { cardHeaderClasses } from '@pxlkit/ui-kit-core';

/**
 * Header part of a `PixelCard`: a row divided from the body. Among the
 * card's direct children it takes the place of the title header.
 */
defineSlots<{ default?(): VNode[] }>();
</script>

<template>
  <header :class="cardHeaderClasses"><slot /></header>
</template>
