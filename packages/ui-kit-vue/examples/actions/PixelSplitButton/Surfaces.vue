<script setup lang="ts">
import { PixelSplitButton } from '@pxlkit/ui-kit-vue';

const exportOptions = [
  { value: 'png', label: 'Export as PNG' },
  { value: 'svg', label: 'Export as SVG' },
  { value: 'json', label: 'Export icon code' },
];
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <PixelSplitButton label="Pixel" surface="pixel" :options="exportOptions" />
    <PixelSplitButton label="Linear" surface="linear" :options="exportOptions" />
  </div>
</template>
