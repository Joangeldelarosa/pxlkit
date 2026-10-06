<script setup lang="ts">
import { PixelStatCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <PixelStatCard label="Top" value="$1,200" icon-position="top" tone="cyan">
      <template #icon><span aria-hidden="true">$</span></template>
    </PixelStatCard>
    <PixelStatCard label="Left" value="$1,200" icon-position="left" tone="green">
      <template #icon><span aria-hidden="true">$</span></template>
    </PixelStatCard>
    <PixelStatCard label="Right" value="$1,200" icon-position="right" tone="purple">
      <template #icon><span aria-hidden="true">$</span></template>
    </PixelStatCard>
    <PixelStatCard label="Bottom-left" value="$1,200" icon-position="bottom-left" tone="gold">
      <template #icon><span aria-hidden="true">$</span></template>
    </PixelStatCard>
  </div>
</template>
