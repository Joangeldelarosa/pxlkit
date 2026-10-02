<script setup lang="ts">
import { PixelZoomIn } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelZoomIn :start-scale="0.6" :duration="500">
    <div style="padding: 16px; background: #A855F7; color: #fff; border-radius: 8px">Bigger zoom from 0.6</div>
  </PixelZoomIn>
</template>
