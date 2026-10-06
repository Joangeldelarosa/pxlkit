<script setup lang="ts">
import { ref } from 'vue';
import { PixelDatePicker } from '@pxlkit/ui-kit-vue';

const date = ref<Date | null>(null);
</script>

<template>
  <PixelDatePicker v-model="date" label="Pick a date" placeholder="Select date" />
</template>
