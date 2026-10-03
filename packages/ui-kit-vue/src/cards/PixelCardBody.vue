<script setup lang="ts">
import type { VNode } from 'vue';
import { cardBodyClasses } from '@pxlkit/ui-kit-core';

/** Body part of a `PixelCard`, which takes the height left over. */
defineSlots<{ default?(): VNode[] }>();
</script>

<template>
  <div :class="cardBodyClasses"><slot /></div>
</template>
