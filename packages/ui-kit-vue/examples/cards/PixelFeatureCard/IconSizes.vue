<script setup lang="ts">
import { PixelFeatureCard } from '@pxlkit/ui-kit-vue';

const cards = [
  { iconSize: 48, title: 'Small', description: '48px icon frame.' },
  { iconSize: 80, title: 'Large', description: '80px icon frame.' },
] as const;
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <PixelFeatureCard
      v-for="card in cards"
      :key="card.iconSize"
      :icon-size="card.iconSize"
      :title="card.title"
      :description="card.description"
    >
      <template #icon>
        <svg viewBox="0 0 8 8" shape-rendering="crispEdges" fill="currentColor" class="h-4 w-4">
          <rect x="3" y="0" width="2" height="8" />
          <rect x="0" y="3" width="8" height="2" />
        </svg>
      </template>
    </PixelFeatureCard>
  </div>
</template>
