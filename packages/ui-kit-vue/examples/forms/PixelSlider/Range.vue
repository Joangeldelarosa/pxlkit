<script setup lang="ts">
import { ref } from 'vue';
import { PixelSlider } from '@pxlkit/ui-kit-vue';

const value = ref<[number, number]>([20, 80]);
</script>

<template>
  <PixelSlider v-model="value" label="Price range" />
</template>
