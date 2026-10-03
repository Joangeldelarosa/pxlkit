<script setup lang="ts">
import { PixelStatCard, PixelStatGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelStatGroup tone="cyan" aria-label="Cyan group">
      <PixelStatCard label="Cyan" value="1" tone="cyan" />
      <PixelStatCard label="Cyan" value="2" tone="cyan" />
    </PixelStatGroup>
    <PixelStatGroup tone="green" aria-label="Green group">
      <PixelStatCard label="Green" value="1" tone="green" />
      <PixelStatCard label="Green" value="2" tone="green" />
    </PixelStatGroup>
  </div>
</template>
