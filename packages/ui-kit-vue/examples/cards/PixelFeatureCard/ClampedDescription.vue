<script setup lang="ts">
import { PixelFeatureCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelFeatureCard
    title="Long Description"
    description="This description is intentionally long to demonstrate the line-clamp behavior. It will be truncated to the configured number of lines with an ellipsis, while maintaining a minimum height so cards stay aligned in a grid."
    :description-lines="2"
  >
    <template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </template>
  </PixelFeatureCard>
</template>
