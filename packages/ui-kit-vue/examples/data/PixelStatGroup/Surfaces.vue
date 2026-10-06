<script setup lang="ts">
import { PixelStatCard, PixelStatGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelStatGroup surface="pixel" aria-label="Pixel surface">
      <PixelStatCard label="Pixel" value="42" />
      <PixelStatCard label="Pixel" value="84" />
    </PixelStatGroup>
    <PixelStatGroup surface="linear" aria-label="Linear surface">
      <PixelStatCard label="Linear" value="42" />
      <PixelStatCard label="Linear" value="84" />
    </PixelStatGroup>
  </div>
</template>
