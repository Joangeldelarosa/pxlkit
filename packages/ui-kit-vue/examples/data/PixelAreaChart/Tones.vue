<script setup lang="ts">
import { PixelAreaChart } from '@pxlkit/ui-kit-vue';

const sample = [
  { x: 'Mon', y: 12 },
  { x: 'Tue', y: 18 },
  { x: 'Wed', y: 9 },
  { x: 'Thu', y: 24 },
  { x: 'Fri', y: 16 },
  { x: 'Sat', y: 21 },
  { x: 'Sun', y: 14 },
];
</script>

<template>
  <div class="flex flex-wrap items-end gap-4">
    <PixelAreaChart :data="sample" tone="cyan" />
    <PixelAreaChart :data="sample" tone="green" />
    <PixelAreaChart :data="sample" tone="gold" />
    <PixelAreaChart :data="sample" tone="red" />
    <PixelAreaChart :data="sample" tone="purple" />
    <PixelAreaChart :data="sample" tone="pink" />
  </div>
</template>
