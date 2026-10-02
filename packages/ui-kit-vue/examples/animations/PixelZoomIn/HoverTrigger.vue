<script setup lang="ts">
import { PixelZoomIn } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelZoomIn trigger="hover" repeat="infinite" :duration="600">
    <button style="padding: 12px; background: #111; color: #fff; border-radius: 6px">Hover me</button>
  </PixelZoomIn>
</template>
