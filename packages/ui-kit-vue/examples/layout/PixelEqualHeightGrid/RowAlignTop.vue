<script setup lang="ts">
import { PixelEqualHeightGrid } from '@pxlkit/ui-kit-vue';

const cards = [
  { title: 'One', body: 'Short copy.' },
  { title: 'Two', body: 'A longer body that would otherwise stretch siblings.' },
  { title: 'Three', body: 'Medium length copy here.' },
];
</script>

<template>
  <PixelEqualHeightGrid :cols="{ base: 1, sm: 3 }" :gap="4" row-align="top">
    <div v-for="card in cards" :key="card.title" class="border border-retro-border p-4">
      <h3 class="text-sm font-semibold text-retro-text">{{ card.title }}</h3>
      <p class="text-sm text-retro-muted">{{ card.body }}</p>
      <div class="mt-2 text-xs text-retro-muted">Footer</div>
    </div>
  </PixelEqualHeightGrid>
</template>
