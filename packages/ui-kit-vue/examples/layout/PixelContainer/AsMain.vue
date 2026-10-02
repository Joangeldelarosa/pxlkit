<script setup lang="ts">
import { PixelContainer } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelContainer as="main" aria-label="Page content" max-width="2xl" :padding="{ x: 'lg', y: 'xl' }">
    <p class="text-sm text-retro-muted">Rendered as the main landmark with split padding.</p>
  </PixelContainer>
</template>
