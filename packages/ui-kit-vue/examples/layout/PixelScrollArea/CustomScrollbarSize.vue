<script setup lang="ts">
import { PixelScrollArea } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelScrollArea aria-label="Custom scrollbar size" type="hover" :max-height="140" :scrollbar-size="10">
    <div class="space-y-2 p-3">
      <p v-for="i in 10" :key="i" class="text-sm text-retro-muted">Hover row {{ i }}</p>
    </div>
  </PixelScrollArea>
</template>
