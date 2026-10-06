<script setup lang="ts">
import { PixelFeatureCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelFeatureCard
    :badge="{ label: 'NEW', tone: 'gold' }"
    title="AI Companion"
    description="A built-in copilot that learns your codebase as you ship it."
  >
    <template #icon>
      <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
        <rect x="3" y="0" width="2" height="8" />
        <rect x="0" y="3" width="8" height="2" />
      </svg>
    </template>
  </PixelFeatureCard>
</template>
