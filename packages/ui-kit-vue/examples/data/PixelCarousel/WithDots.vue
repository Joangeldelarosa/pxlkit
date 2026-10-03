<script setup lang="ts">
import { PixelCarousel, PixelCarouselItem } from '@pxlkit/ui-kit-vue';

const slides = [
  { label: 'One', tone: 'rgba(14,165,233,0.15)' },
  { label: 'Two', tone: 'rgba(168,85,247,0.15)' },
  { label: 'Three', tone: 'rgba(34,197,94,0.15)' },
];
</script>

<template>
  <PixelCarousel aria-label="Featured items with dots" show-dots>
    <PixelCarouselItem v-for="slide in slides" :key="slide.label">
      <div class="flex h-32 items-center justify-center border border-retro-border bg-retro-surface text-retro-text" :style="{ background: slide.tone }">
        <span class="text-xs">{{ slide.label }}</span>
      </div>
    </PixelCarouselItem>
  </PixelCarousel>
</template>
