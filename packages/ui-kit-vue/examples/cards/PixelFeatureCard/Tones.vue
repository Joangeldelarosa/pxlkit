<script setup lang="ts">
import { PixelFeatureCard, type ToneKey } from '@pxlkit/ui-kit-vue';

const cards: { tone: ToneKey; title: string }[] = [
  { tone: 'cyan', title: 'Cyan' },
  { tone: 'green', title: 'Green' },
  { tone: 'gold', title: 'Gold' },
  { tone: 'purple', title: 'Purple' },
];
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <PixelFeatureCard
      v-for="card in cards"
      :key="card.tone"
      :tone="card.tone"
      :title="card.title"
      description="Tinted icon frame."
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
