<script setup lang="ts">
import { PixelFeatureCard, type Surface } from '@pxlkit/ui-kit-vue';

const cards: { surface: Surface; title: string; description: string }[] = [
  { surface: 'pixel', title: 'Pixel', description: 'Thick border + offset shadow.' },
  { surface: 'linear', title: 'Linear', description: 'Soft border + smooth radius.' },
];
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <PixelFeatureCard
      v-for="card in cards"
      :key="card.surface"
      :surface="card.surface"
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
