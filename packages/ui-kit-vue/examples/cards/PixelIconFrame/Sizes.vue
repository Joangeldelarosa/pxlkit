<script setup lang="ts">
import { PixelIconFrame } from '@pxlkit/ui-kit-vue';

const sizes = [48, 56, 64, 80, 112] as const;
</script>

<template>
  <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
    <PixelIconFrame v-for="size in sizes" :key="size" :size="size">
      <template #icon><span style="font-family: monospace; font-weight: 700">&gt;_</span></template>
    </PixelIconFrame>
  </div>
</template>
