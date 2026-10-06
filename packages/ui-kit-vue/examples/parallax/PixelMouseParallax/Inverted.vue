<script setup lang="ts">
import { PixelMouseParallax } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="relative h-64 w-full overflow-hidden rounded border border-retro-border bg-retro-bg">
    <PixelMouseParallax :strength="30" invert>
      <div
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-retro-purple/20 px-4 py-2 text-sm text-retro-purple"
      >
        Repels from the cursor
      </div>
    </PixelMouseParallax>
  </div>
</template>
