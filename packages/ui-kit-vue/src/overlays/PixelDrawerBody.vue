<script setup lang="ts">
import type { VNode } from 'vue';
import { drawerBodyClasses } from '@pxlkit/ui-kit-core';

/** Scrolling body of a `PixelDrawer`. */
defineSlots<{ default?(): VNode[] }>();
</script>

<template>
  <div :class="drawerBodyClasses"><slot /></div>
</template>
