<script setup lang="ts">
import { ref } from 'vue';
import { PixelColorInput } from '@pxlkit/ui-kit-vue';

const value = ref('#ef4444');
const presets = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#a855f7'];
</script>

<template>
  <PixelColorInput v-model="value" label="Theme tone" :presets="presets" />
</template>
