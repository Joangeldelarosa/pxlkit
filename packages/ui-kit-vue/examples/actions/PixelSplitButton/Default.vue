<script setup lang="ts">
import { PixelSplitButton } from '@pxlkit/ui-kit-vue';

const exportOptions = [
  { value: 'png', label: 'Export as PNG' },
  { value: 'svg', label: 'Export as SVG' },
  { value: 'json', label: 'Export icon code' },
];
</script>

<template>
  <PixelSplitButton label="Export" :options="exportOptions" @primary="() => {}" @select="() => {}" />
</template>
