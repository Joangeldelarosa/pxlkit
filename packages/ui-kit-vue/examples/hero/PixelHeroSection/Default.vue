<script setup lang="ts">
import { PixelHeroSection } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelHeroSection
    eyebrow="Introducing"
    headline="Pixel-perfect retro UI for modern web"
    subline="A component kit that brings cinematic, terminal-grade interfaces to React apps."
  >
    <template #primary-cta><button type="button">Get started</button></template>
    <template #secondary-cta><button type="button">View docs</button></template>
  </PixelHeroSection>
</template>
