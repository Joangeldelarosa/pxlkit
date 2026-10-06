<script setup lang="ts">
import { PixelProgress } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="space-y-3">
    <PixelProgress :value="0" label="0%" />
    <PixelProgress :value="25" label="25%" />
    <PixelProgress :value="50" label="50%" />
    <PixelProgress :value="75" label="75%" />
    <PixelProgress :value="100" label="100%" />
  </div>
</template>
