<script setup lang="ts">
import { PixelBadge, PixelBadgeGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelBadgeGroup aria-label="Pixel tags" surface="pixel">
      <PixelBadge tone="cyan">pixel</PixelBadge>
      <PixelBadge tone="green">chamfered</PixelBadge>
      <PixelBadge tone="gold">retro</PixelBadge>
    </PixelBadgeGroup>
    <PixelBadgeGroup aria-label="Linear tags" surface="linear">
      <PixelBadge tone="cyan">linear</PixelBadge>
      <PixelBadge tone="green">pill</PixelBadge>
      <PixelBadge tone="gold">modern</PixelBadge>
    </PixelBadgeGroup>
  </div>
</template>
