<script setup lang="ts">
import { PixelColorSwatch } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl">
    <PixelColorSwatch name="green" css-var="--color-retro-green" />
    <PixelColorSwatch name="cyan" css-var="--color-retro-cyan" />
    <PixelColorSwatch name="gold" css-var="--color-retro-gold" />
    <PixelColorSwatch name="purple" css-var="--color-retro-purple" />
    <PixelColorSwatch name="red" css-var="--color-retro-red" />
    <PixelColorSwatch name="pink" css-var="--color-retro-pink" />
  </div>
</template>
