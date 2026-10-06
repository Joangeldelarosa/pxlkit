<script setup lang="ts">
import { PixelFeatureCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelFeatureCard title="Realtime sync" description="Push every keystroke to peers via WebSockets.">
    <template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </template>
    <template #footer>
      <span class="text-xs text-retro-muted">Learn more →</span>
    </template>
  </PixelFeatureCard>
</template>
