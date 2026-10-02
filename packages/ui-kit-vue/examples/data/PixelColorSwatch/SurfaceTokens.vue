<script setup lang="ts">
import { PixelColorSwatch } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="grid grid-cols-2 gap-3 max-w-md">
    <PixelColorSwatch name="surface" css-var="--color-retro-surface" />
    <PixelColorSwatch name="border" css-var="--color-retro-border" />
    <PixelColorSwatch name="text" css-var="--color-retro-text" />
    <PixelColorSwatch name="muted" css-var="--color-retro-muted" />
  </div>
</template>
