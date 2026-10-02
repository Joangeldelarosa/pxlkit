<script setup lang="ts">
import { PixelCollapsible } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelCollapsible label="Pixel surface" surface="pixel">
      <p class="text-xs text-retro-muted">Retro pixel typography.</p>
    </PixelCollapsible>
    <PixelCollapsible label="Linear surface" surface="linear">
      <p class="text-xs text-retro-muted">Smoother linear surface.</p>
    </PixelCollapsible>
  </div>
</template>
