<script setup lang="ts">
import { PixelStatCard, PixelStatGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelStatGroup aria-label="Key metrics">
    <PixelStatCard label="Users" value="1,284" />
    <PixelStatCard label="Revenue" value="$12.4k" />
    <PixelStatCard label="Active" value="312" />
  </PixelStatGroup>
</template>
