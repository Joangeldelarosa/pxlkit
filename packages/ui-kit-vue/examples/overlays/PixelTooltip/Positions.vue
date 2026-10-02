<script setup lang="ts">
import { PixelButton, PixelTooltip } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <PixelTooltip label="Top tooltip" position="top">
      <PixelButton>Top</PixelButton>
    </PixelTooltip>
    <PixelTooltip label="Bottom tooltip" position="bottom">
      <PixelButton>Bottom</PixelButton>
    </PixelTooltip>
    <PixelTooltip label="Left tooltip" position="left">
      <PixelButton>Left</PixelButton>
    </PixelTooltip>
    <PixelTooltip label="Right tooltip" position="right">
      <PixelButton>Right</PixelButton>
    </PixelTooltip>
  </div>
</template>
