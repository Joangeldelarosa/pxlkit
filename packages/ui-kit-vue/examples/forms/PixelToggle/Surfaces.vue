<script setup lang="ts">
import { ref } from 'vue';
import { PixelToggle } from '@pxlkit/ui-kit-vue';

const pixel = ref(true);
const linear = ref(true);
</script>

<template>
  <div class="flex items-center gap-2">
    <PixelToggle v-model:pressed="pixel" value="pixel" surface="pixel">Pixel</PixelToggle>
    <PixelToggle v-model:pressed="linear" value="linear" surface="linear">Linear</PixelToggle>
  </div>
</template>
