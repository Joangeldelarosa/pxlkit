<script setup lang="ts">
import { PixelStatCard, PixelStatGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelStatGroup layout="row" aria-label="Row metrics">
    <PixelStatCard label="Sessions" value="842" />
    <PixelStatCard label="Conversions" value="56" />
    <PixelStatCard label="Bounce" value="24%" />
  </PixelStatGroup>
</template>
