<script setup lang="ts">
import { PixelStatCard, PixelStatGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelStatGroup layout="grid" :columns="3" :gap="3" aria-label="Spaced grid metrics">
    <PixelStatCard label="Users" value="1,284" />
    <PixelStatCard label="Revenue" value="$12.4k" />
    <PixelStatCard label="Active" value="312" />
  </PixelStatGroup>
</template>
