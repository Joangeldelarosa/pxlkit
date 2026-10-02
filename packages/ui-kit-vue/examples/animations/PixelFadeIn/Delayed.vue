<script setup lang="ts">
import { PixelFadeIn } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelFadeIn :duration="600" :delay="200" easing="ease-out">
    <div style="padding: 16px; background: #0EA5E9; color: #000">Delayed fade-in</div>
  </PixelFadeIn>
</template>
