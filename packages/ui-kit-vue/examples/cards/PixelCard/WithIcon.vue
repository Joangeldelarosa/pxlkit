<script setup lang="ts">
import { PixelCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelCard title="System Health">
    <template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-3 w-3">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </template>
    <p>All checks green. Last sync 3 minutes ago.</p>
  </PixelCard>
</template>
