<script setup lang="ts">
import { ref } from 'vue';
import { PixelSlider } from '@pxlkit/ui-kit-vue';

const value = ref(30);
</script>

<template>
  <PixelSlider v-model="value" label="Required setting" required name="setting" />
</template>
