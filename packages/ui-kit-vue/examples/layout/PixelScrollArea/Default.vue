<script setup lang="ts">
import { PixelScrollArea } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelScrollArea aria-label="Sample scrollable region" :max-height="160">
    <div class="space-y-2 p-3">
      <p v-for="i in 12" :key="i" class="text-sm text-retro-muted">Scroll item {{ i }}</p>
    </div>
  </PixelScrollArea>
</template>
