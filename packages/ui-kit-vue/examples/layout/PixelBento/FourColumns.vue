<script setup lang="ts">
import { PixelBento, PixelBentoCell } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBento :columns="4" :gap="3">
    <PixelBentoCell span="2x2" kind="feature" tone="cyan">
      <strong>Hero</strong>
    </PixelBentoCell>
    <PixelBentoCell span="1x1" kind="stat" tone="green">
      <strong>12</strong>
      <span>Active</span>
    </PixelBentoCell>
    <PixelBentoCell span="1x1" kind="stat" tone="gold">
      <strong>87%</strong>
      <span>Uptime</span>
    </PixelBentoCell>
    <PixelBentoCell span="1x1" kind="compact" tone="red">
      <span>Alert</span>
    </PixelBentoCell>
    <PixelBentoCell span="1x1" kind="compact" tone="purple">
      <span>Tag</span>
    </PixelBentoCell>
  </PixelBento>
</template>
