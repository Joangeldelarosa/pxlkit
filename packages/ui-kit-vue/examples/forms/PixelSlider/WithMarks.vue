<script setup lang="ts">
import { ref } from 'vue';
import { PixelSlider } from '@pxlkit/ui-kit-vue';

const value = ref(50);
const marks = [
  { value: 0, label: 'Low' },
  { value: 25, label: 'Med' },
  { value: 50, label: 'High' },
  { value: 75, label: 'Ultra' },
  { value: 100, label: 'Max' },
];
</script>

<template>
  <PixelSlider v-model="value" label="Quality" :marks="marks" />
</template>
