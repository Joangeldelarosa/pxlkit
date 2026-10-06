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
    <PixelSplitButton label="Green" tone="green" :options="exportOptions" />
    <PixelSplitButton label="Cyan" tone="cyan" :options="exportOptions" />
    <PixelSplitButton label="Gold" tone="gold" :options="exportOptions" />
    <PixelSplitButton label="Red" tone="red" :options="exportOptions" />
    <PixelSplitButton label="Purple" tone="purple" :options="exportOptions" />
    <PixelSplitButton label="Pink" tone="pink" :options="exportOptions" />
    <PixelSplitButton label="Neutral" tone="neutral" :options="exportOptions" />
  </div>
</template>
