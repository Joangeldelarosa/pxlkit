<script setup lang="ts">
import { PixelBareTextarea } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBareTextarea
    class="w-full rounded border border-retro-border bg-retro-card p-3 font-mono text-sm text-retro-text"
    placeholder="Escape-hatch: bring your own styles"
    :rows="5"
    aria-label="Custom styled textarea"
  />
</template>
