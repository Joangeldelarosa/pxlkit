<script setup lang="ts">
import { ref } from 'vue';
import { PixelSlider } from '@pxlkit/ui-kit-vue';

const value = ref(75);
</script>

<template>
  <PixelSlider v-model="value" label="Brightness" :min="0" :max="200" :step="5" show-min-max />
</template>
