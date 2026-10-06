<script setup lang="ts">
import { PixelBento, PixelBentoCell } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBento :columns="3" :gap="4">
    <PixelBentoCell kind="feature" tone="neutral" span="2x1">
      <h3 class="text-sm font-semibold">Feature cell</h3>
      <p class="text-sm text-retro-muted">Span 2x1 with feature layout.</p>
    </PixelBentoCell>
    <PixelBentoCell kind="stat" tone="cyan" span="1x1">
      <span class="text-xs text-retro-muted">Active</span>
      <strong class="text-2xl">128</strong>
    </PixelBentoCell>
    <PixelBentoCell kind="compact" tone="green" span="1x1">
      <span class="text-sm">Compact</span>
    </PixelBentoCell>
  </PixelBento>
</template>
