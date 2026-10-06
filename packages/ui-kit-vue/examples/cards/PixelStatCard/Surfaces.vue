<script setup lang="ts">
import { PixelStatCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <PixelStatCard label="Pixel" value="$4,200" surface="pixel" tone="gold" trend="+6%" />
    <PixelStatCard label="Linear" value="$4,200" surface="linear" tone="gold" trend="+6%" />
  </div>
</template>
