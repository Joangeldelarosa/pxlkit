<script setup lang="ts">
import { PixelHeroSection } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelHeroSection
    variant="split"
    eyebrow="New in v2"
    headline="Compose richer hero sections"
    subline="Pair a tagline with media on the side using the split variant."
    tone="cyan"
  >
    <template #primary-cta><button type="button">Try it</button></template>
    <template #media>
      <div style="width: 100%; height: 240px; background: #111; border: 1px solid #333" />
    </template>
  </PixelHeroSection>
</template>
