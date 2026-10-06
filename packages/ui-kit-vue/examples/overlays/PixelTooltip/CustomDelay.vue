<script setup lang="ts">
import { PixelButton, PixelTooltip } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <PixelTooltip label="Opens instantly" :delay="{ open: 0, close: 0 }">
      <PixelButton>Instant</PixelButton>
    </PixelTooltip>
    <PixelTooltip label="Slow open, fast close" :delay="{ open: 600, close: 0 }">
      <PixelButton>Slow open</PixelButton>
    </PixelTooltip>
  </div>
</template>
