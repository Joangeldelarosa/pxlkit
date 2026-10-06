<script setup lang="ts">
import { PixelSlideIn } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelSlideIn from="left" :duration="500" :distance="20">
    <div style="padding: 16px; background: #0EA5E9; color: #000">Slides in from the left</div>
  </PixelSlideIn>
</template>
