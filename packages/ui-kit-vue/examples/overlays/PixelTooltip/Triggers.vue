<script setup lang="ts">
import { PixelButton, PixelTooltip } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <PixelTooltip label="Opens on hover or focus" trigger="hover">
      <PixelButton>Hover</PixelButton>
    </PixelTooltip>
    <PixelTooltip label="Opens on focus only" trigger="focus">
      <PixelButton>Focus</PixelButton>
    </PixelTooltip>
    <PixelTooltip label="Click to toggle, Escape to close" trigger="click">
      <PixelButton>Click</PixelButton>
    </PixelTooltip>
  </div>
</template>
