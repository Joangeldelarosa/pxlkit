<script setup lang="ts">
import { ref } from 'vue';
import { PixelDateRangePicker, type DateRangeValue } from '@pxlkit/ui-kit-vue';

const range = ref<DateRangeValue>({});
const today = new Date();
const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const last7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
const last30 = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
const next7 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
const presets = [
  { label: 'Last 7 days', value: { from: last7, to: start } },
  { label: 'Last 30 days', value: { from: last30, to: start } },
  { label: 'Next 7 days', value: { from: start, to: next7 } },
];
</script>

<template>
  <PixelDateRangePicker v-model="range" label="Reporting period" clearable :presets="presets" />
</template>
