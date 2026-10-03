<script setup lang="ts">
import { PixelParallaxLayer } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="relative w-full overflow-hidden">
    <PixelParallaxLayer :speed="0.4" axis="x">
      <div style="padding: 24px; background: #0EA5E9; color: #fff">Horizontal parallax drift.</div>
    </PixelParallaxLayer>
  </div>
</template>
