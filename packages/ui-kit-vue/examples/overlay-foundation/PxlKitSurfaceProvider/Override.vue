<script setup lang="ts">
import { PixelButton, PxlKitSurfaceProvider } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PxlKitSurfaceProvider surface="linear">
    <div class="flex flex-wrap gap-2">
      <PixelButton>From the provider</PixelButton>
      <PixelButton surface="pixel">Own surface prop</PixelButton>
    </div>
  </PxlKitSurfaceProvider>
</template>
