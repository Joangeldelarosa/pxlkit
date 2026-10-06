<script setup lang="ts">
import { PixelButton, PxlKitSurfaceProvider } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PxlKitSurfaceProvider surface="pixel">
    <div class="flex flex-wrap gap-2">
      <PixelButton>Pixel</PixelButton>
      <PixelButton variant="outline" tone="cyan">Pixel outline</PixelButton>
    </div>
  </PxlKitSurfaceProvider>
</template>
