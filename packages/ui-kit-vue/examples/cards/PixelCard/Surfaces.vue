<script setup lang="ts">
import { PixelCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <PixelCard title="Pixel" surface="pixel">Thick border + offset shadow.</PixelCard>
    <PixelCard title="Linear" surface="linear">Soft border + smooth radius.</PixelCard>
  </div>
</template>
