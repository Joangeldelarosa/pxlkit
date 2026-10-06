<script setup lang="ts">
import { PixelGrid } from '@pxlkit/ui-kit-vue';

const cells = ['Auto A', 'Auto B', 'Auto C', 'Auto D'];
</script>

<template>
  <PixelGrid auto-fit min-col-width="12rem" :gap="4">
    <div v-for="cell in cells" :key="cell" class="border border-retro-border bg-retro-surface p-3 text-sm text-retro-text">
      {{ cell }}
    </div>
  </PixelGrid>
</template>
