<script setup lang="ts">
import { ref } from 'vue';
import { PixelCalendarGrid } from '@pxlkit/ui-kit-vue';

const today = new Date();
const min = new Date(today.getFullYear(), today.getMonth(), 1);
const max = new Date(today.getFullYear(), today.getMonth() + 1, 0);
const value = ref<Date | null>(null);
</script>

<template>
  <PixelCalendarGrid v-model="value" :min-date="min" :max-date="max" />
</template>
