<script setup lang="ts">
import { PixelBento, PixelBentoCell } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBento :columns="3" :gap="4">
    <PixelBentoCell span="2x2" kind="feature" tone="cyan">
      <strong>Feature</strong>
      <span>Spans 2x2 with a feature layout.</span>
    </PixelBentoCell>
    <PixelBentoCell span="1x1" kind="stat" tone="green">
      <strong>42</strong>
      <span>Stats</span>
    </PixelBentoCell>
    <PixelBentoCell span="1x1" kind="compact" tone="gold">
      <span>Compact</span>
    </PixelBentoCell>
    <PixelBentoCell span="2x1" kind="feature" tone="purple">
      <strong>Wide</strong>
      <span>Spans 2x1.</span>
    </PixelBentoCell>
    <PixelBentoCell span="1x1" kind="media" tone="neutral">
      <div class="h-full w-full bg-retro-surface" />
    </PixelBentoCell>
  </PixelBento>
</template>
