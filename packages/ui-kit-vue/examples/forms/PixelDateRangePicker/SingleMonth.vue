<script setup lang="ts">
import { ref } from 'vue';
import { PixelDateRangePicker, type DateRangeValue } from '@pxlkit/ui-kit-vue';

const range = ref<DateRangeValue>({});
</script>

<template>
  <PixelDateRangePicker
    v-model="range"
    label="Single-month view"
    hint="Compact one-month calendar"
    :number-of-months="1"
    clearable
  />
</template>
