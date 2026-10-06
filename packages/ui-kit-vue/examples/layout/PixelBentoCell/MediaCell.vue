<script setup lang="ts">
import { PixelBento, PixelBentoCell } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBento :columns="3" :gap="4">
    <PixelBentoCell kind="media" tone="neutral" span="2x2">
      <div class="flex h-full min-h-[160px] items-center justify-center bg-retro-surface/40 text-sm text-retro-muted">
        Media slot
      </div>
    </PixelBentoCell>
    <PixelBentoCell kind="feature" tone="cyan" span="1x1">
      <h3 class="text-sm font-semibold">Caption</h3>
      <p class="text-sm text-retro-muted">Pairs with media.</p>
    </PixelBentoCell>
  </PixelBento>
</template>
