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
    <PixelBarChart :data="sample" size="sm" tone="cyan" />
    <PixelBarChart :data="sample" size="md" tone="cyan" />
    <PixelBarChart :data="sample" size="lg" tone="cyan" />
  </div>
</template>
