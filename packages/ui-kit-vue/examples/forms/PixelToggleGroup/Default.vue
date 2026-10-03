<script setup lang="ts">
import { ref } from 'vue';
import { PixelToggle, PixelToggleGroup } from '@pxlkit/ui-kit-vue';

const value = ref('left');
</script>

<template>
  <PixelToggleGroup v-model="value" type="single" aria-label="Text alignment">
    <PixelToggle value="left">Left</PixelToggle>
    <PixelToggle value="center">Center</PixelToggle>
    <PixelToggle value="right">Right</PixelToggle>
  </PixelToggleGroup>
</template>
