<script setup lang="ts">
import { PixelBadge, PixelBadgeGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBadgeGroup aria-label="Stack" :max="3">
    <PixelBadge tone="cyan">react</PixelBadge>
    <PixelBadge tone="green">typescript</PixelBadge>
    <PixelBadge tone="gold">design</PixelBadge>
    <PixelBadge tone="purple">tailwind</PixelBadge>
    <PixelBadge tone="pink">motion</PixelBadge>
    <PixelBadge tone="red">vitest</PixelBadge>
  </PixelBadgeGroup>
</template>
