<script setup lang="ts">
import { PixelIconFrame } from '@pxlkit/ui-kit-vue';

const shapes = ['square', 'rounded', 'circle'] as const;
</script>

<template>
  <div style="display: flex; gap: 12px; flex-wrap: wrap">
    <PixelIconFrame v-for="shape in shapes" :key="shape" :shape="shape">
      <template #icon><span style="font-family: monospace; font-weight: 700">&gt;_</span></template>
    </PixelIconFrame>
  </div>
</template>
