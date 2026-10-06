<script setup lang="ts">
import { ref } from 'vue';
import { PixelSlider } from '@pxlkit/ui-kit-vue';

const value = ref<[number, number]>([30, 70]);
const marks = [
  { value: 0, label: '0' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
];
</script>

<template>
  <PixelSlider v-model="value" label="Filter range" show-min-max show-tooltip="always" :marks="marks" />
</template>
