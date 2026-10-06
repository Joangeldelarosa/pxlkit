<script setup lang="ts">
import { ref } from 'vue';
import { PixelDateRangePicker, type DateRangeValue } from '@pxlkit/ui-kit-vue';

const range = ref<DateRangeValue>({});
</script>

<template>
  <PixelDateRangePicker v-model="range" label="Date range" placeholder="Select date range" />
</template>
