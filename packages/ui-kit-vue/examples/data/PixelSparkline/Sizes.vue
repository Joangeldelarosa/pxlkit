<script setup lang="ts">
import { PixelSparkline } from '@pxlkit/ui-kit-vue';

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
  <div class="flex flex-wrap items-center gap-4">
    <PixelSparkline :data="sample" size="sm" tone="cyan" />
    <PixelSparkline :data="sample" size="md" tone="cyan" />
    <PixelSparkline :data="sample" size="lg" tone="cyan" />
  </div>
</template>
