<script setup lang="ts">
import { PixelProgress } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="space-y-4">
    <PixelProgress :value="55" label="Pixel (segmented)" surface="pixel" />
    <PixelProgress :value="55" label="Linear (smooth)" surface="linear" />
  </div>
</template>
