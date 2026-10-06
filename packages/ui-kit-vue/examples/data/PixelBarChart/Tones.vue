<script setup lang="ts">
import { PixelBarChart } from '@pxlkit/ui-kit-vue';

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
    <PixelBarChart :data="sample" tone="cyan" />
    <PixelBarChart :data="sample" tone="green" />
    <PixelBarChart :data="sample" tone="gold" />
    <PixelBarChart :data="sample" tone="red" />
    <PixelBarChart :data="sample" tone="purple" />
    <PixelBarChart :data="sample" tone="pink" />
  </div>
</template>
