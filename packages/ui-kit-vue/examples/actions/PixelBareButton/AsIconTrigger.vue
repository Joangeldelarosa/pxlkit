<script setup lang="ts">
import { PixelBareButton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBareButton
    aria-label="Close"
    class="inline-flex h-6 w-6 items-center justify-center text-retro-muted hover:text-retro-text"
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  </PixelBareButton>
</template>
