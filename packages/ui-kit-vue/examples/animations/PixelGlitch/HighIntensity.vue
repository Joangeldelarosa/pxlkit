<script setup lang="ts">
import { PixelGlitch } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelGlitch :intensity="8" :duration="2000">
    <span class="text-2xl font-bold">CRITICAL ERROR</span>
  </PixelGlitch>
</template>
