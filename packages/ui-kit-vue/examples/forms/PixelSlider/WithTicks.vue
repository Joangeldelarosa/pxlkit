<script setup lang="ts">
import { ref } from 'vue';
import { PixelSlider } from '@pxlkit/ui-kit-vue';

const value = ref(40);
</script>

<template>
  <PixelSlider v-model="value" label="Step ticks" :min="0" :max="100" :step="10" ticks />
</template>
