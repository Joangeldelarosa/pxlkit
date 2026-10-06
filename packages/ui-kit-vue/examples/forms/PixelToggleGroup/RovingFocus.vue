<script setup lang="ts">
import { ref } from 'vue';
import { PixelToggle, PixelToggleGroup } from '@pxlkit/ui-kit-vue';

const value = ref('list');
</script>

<template>
  <PixelToggleGroup v-model="value" type="single" roving-focus loop aria-label="View mode">
    <PixelToggle value="list">List</PixelToggle>
    <PixelToggle value="grid">Grid</PixelToggle>
    <PixelToggle value="board">Board</PixelToggle>
  </PixelToggleGroup>
</template>
