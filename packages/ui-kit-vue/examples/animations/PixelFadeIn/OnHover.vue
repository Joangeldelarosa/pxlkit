<script setup lang="ts">
import { PixelFadeIn } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelFadeIn trigger="hover" :duration="300">
    <div style="padding: 16px; background: #222; color: #0EA5E9">Hover to fade in</div>
  </PixelFadeIn>
</template>
