<script setup lang="ts">
import { PixelBento, PixelBentoCell } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBento :columns="3" :gap="3">
    <PixelBentoCell tone="purple" kind="stat">
      <span class="text-xs text-retro-muted">Purple</span>
      <strong class="text-2xl">42</strong>
    </PixelBentoCell>
    <PixelBentoCell tone="gold" kind="stat">
      <span class="text-xs text-retro-muted">Gold</span>
      <strong class="text-2xl">7</strong>
    </PixelBentoCell>
    <PixelBentoCell tone="red" kind="stat">
      <span class="text-xs text-retro-muted">Red</span>
      <strong class="text-2xl">3</strong>
    </PixelBentoCell>
  </PixelBento>
</template>
