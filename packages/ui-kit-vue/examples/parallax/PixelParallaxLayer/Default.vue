<script setup lang="ts">
import { PixelParallaxLayer } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelParallaxLayer :speed="0.5" axis="y">
    <div style="padding: 24px; background: #111; color: #fff">Scroll to see this layer move at half speed.</div>
  </PixelParallaxLayer>
</template>
