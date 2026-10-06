<script setup lang="ts">
import { ref } from 'vue';
import { PixelToggle, PixelToggleGroup } from '@pxlkit/ui-kit-vue';

const value = ref(['bold']);
</script>

<template>
  <PixelToggleGroup v-model="value" type="multiple" aria-label="Text formatting">
    <PixelToggle value="bold">Bold</PixelToggle>
    <PixelToggle value="italic">Italic</PixelToggle>
    <PixelToggle value="underline">Underline</PixelToggle>
  </PixelToggleGroup>
</template>
