<script setup lang="ts">
import { PixelButton, PixelTooltip } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <PixelTooltip label="Tight (2px)" :side-offset="2">
      <PixelButton>Tight</PixelButton>
    </PixelTooltip>
    <PixelTooltip label="Roomy (16px)" :side-offset="16">
      <PixelButton>Roomy</PixelButton>
    </PixelTooltip>
  </div>
</template>
