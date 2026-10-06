<script setup lang="ts">
import { h } from 'vue';
import { PixelIconFrame } from '@pxlkit/ui-kit-vue';

const dot = () =>
  h('span', {
    style: { width: '6px', height: '6px', borderRadius: '9999px', background: 'currentColor', display: 'inline-block' },
  });
</script>

<template>
  <PixelIconFrame tone="cyan" :accent="{ icon: dot, position: 'top-right' }">
    <template #icon><span style="font-family: monospace; font-weight: 700">&gt;_</span></template>
  </PixelIconFrame>
</template>
