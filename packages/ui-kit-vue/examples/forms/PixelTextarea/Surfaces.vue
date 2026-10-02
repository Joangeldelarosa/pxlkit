<script setup lang="ts">
import { PixelTextarea } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelTextarea label="Pixel surface" surface="pixel" default-value="Chunky pixel chrome" />
    <PixelTextarea label="Linear surface" surface="linear" default-value="Sleek linear chrome" />
  </div>
</template>
