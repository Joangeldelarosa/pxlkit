<script setup lang="ts">
import { PxlKitButton, type Tone } from '@pxlkit/ui-kit-vue';

const tones: { tone: Tone; label: string }[] = [
  { tone: 'neutral', label: 'Neutral' },
  { tone: 'green', label: 'Green' },
  { tone: 'cyan', label: 'Cyan' },
  { tone: 'gold', label: 'Gold' },
  { tone: 'red', label: 'Red' },
  { tone: 'purple', label: 'Purple' },
  { tone: 'pink', label: 'Pink' },
];
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <PxlKitButton v-for="item in tones" :key="item.tone" :label="item.label" :tone="item.tone">
      <template #icon>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
        </svg>
      </template>
    </PxlKitButton>
  </div>
</template>
