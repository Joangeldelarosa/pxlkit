<script setup lang="ts">
import { ref } from 'vue';
import { PixelCalendarGrid } from '@pxlkit/ui-kit-vue';

const value = ref<Date | null>(null);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
</script>

<template>
  <PixelCalendarGrid v-model="value" :disabled-dates="isWeekend" />
</template>
