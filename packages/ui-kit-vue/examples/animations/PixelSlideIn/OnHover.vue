<script setup lang="ts">
import { PixelSlideIn } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelSlideIn trigger="hover" from="right" :duration="300">
    <div style="padding: 16px; background: #222; color: #0EA5E9">Hover to slide in from the right</div>
  </PixelSlideIn>
</template>
