<script setup lang="ts">
import { PixelTwoColumn } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTwoColumn ratio="60/40" :gap="6">
    <template #left><div class="text-sm text-retro-muted">Main content (60%)</div></template>
    <template #right><div class="text-sm text-retro-muted">Sidebar (40%)</div></template>
  </PixelTwoColumn>
</template>
