<script setup lang="ts">
import { ref } from 'vue';
import { PixelDatePicker } from '@pxlkit/ui-kit-vue';

const date = ref<Date | null>(null);
const today = new Date();
const min = new Date(today.getFullYear(), today.getMonth(), today.getDate());
const max = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
</script>

<template>
  <PixelDatePicker
    v-model="date"
    label="Within one month"
    hint="Only the next 30 days are selectable"
    :min="min"
    :max="max"
  />
</template>
