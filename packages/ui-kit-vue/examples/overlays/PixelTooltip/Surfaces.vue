<script setup lang="ts">
import { PixelButton, PixelTooltip } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <PixelTooltip label="Pixel surface" surface="pixel">
      <PixelButton surface="pixel">Pixel</PixelButton>
    </PixelTooltip>
    <PixelTooltip label="Linear surface" surface="linear">
      <PixelButton surface="linear">Linear</PixelButton>
    </PixelTooltip>
  </div>
</template>
