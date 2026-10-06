<script setup lang="ts">
import { ref } from 'vue';
import { PixelDatePicker } from '@pxlkit/ui-kit-vue';

const date = ref<Date | null>(null);
const today = new Date();
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
const presets = [
  { label: 'Today', value: today },
  { label: 'Tomorrow', value: tomorrow },
  { label: 'Next week', value: nextWeek },
];
</script>

<template>
  <PixelDatePicker v-model="date" label="Due date" clearable :presets="presets" />
</template>
