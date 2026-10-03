<script setup lang="ts">
import { PixelStatCard, PixelStatGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelStatGroup layout="grid" :columns="4" aria-label="Grid metrics">
    <PixelStatCard label="A" value="10" />
    <PixelStatCard label="B" value="20" />
    <PixelStatCard label="C" value="30" />
    <PixelStatCard label="D" value="40" />
  </PixelStatGroup>
</template>
