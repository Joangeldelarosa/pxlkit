<script setup lang="ts">
import { PixelColorSwatch } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-4">
    <PixelColorSwatch name="cyan" css-var="--color-retro-cyan" surface="pixel" />
    <PixelColorSwatch name="cyan" css-var="--color-retro-cyan" surface="linear" />
  </div>
</template>
