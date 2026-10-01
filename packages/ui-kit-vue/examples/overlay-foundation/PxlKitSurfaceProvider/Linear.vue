<script setup lang="ts">
import { PixelButton, PxlKitSurfaceProvider } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PxlKitSurfaceProvider surface="linear">
    <div class="flex flex-wrap gap-2">
      <PixelButton>Linear</PixelButton>
      <PixelButton variant="outline" tone="cyan">Linear outline</PixelButton>
    </div>
  </PxlKitSurfaceProvider>
</template>
