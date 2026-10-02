<script setup lang="ts">
import { PixelEqualHeightGrid } from '@pxlkit/ui-kit-vue';

const cards = [
  { title: 'Pixel A', body: 'Surface-aware grid item.' },
  { title: 'Pixel B', body: 'Renders with the pixel surface tokens applied to the grid.' },
];
</script>

<template>
  <PixelEqualHeightGrid :cols="2" :gap="4" surface="pixel">
    <div v-for="card in cards" :key="card.title" class="border border-retro-border p-4">
      <h3 class="text-sm font-semibold text-retro-text">{{ card.title }}</h3>
      <p class="text-sm text-retro-muted">{{ card.body }}</p>
      <div class="mt-2 text-xs text-retro-muted">Footer</div>
    </div>
  </PixelEqualHeightGrid>
</template>
