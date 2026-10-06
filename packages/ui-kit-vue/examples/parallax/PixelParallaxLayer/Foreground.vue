<script setup lang="ts">
import { PixelParallaxLayer } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelParallaxLayer :speed="-0.3" axis="y">
    <div style="padding: 24px; background: #222; color: #fff">Foreground float-up (negative speed).</div>
  </PixelParallaxLayer>
</template>
