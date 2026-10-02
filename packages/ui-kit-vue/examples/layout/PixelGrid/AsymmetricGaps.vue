<script setup lang="ts">
import { PixelGrid } from '@pxlkit/ui-kit-vue';

const cells = ['A', 'B', 'C', 'D'];
</script>

<template>
  <PixelGrid :cols="2" :col-gap="8" :row-gap="2">
    <div v-for="cell in cells" :key="cell" class="border border-retro-border bg-retro-surface p-3 text-sm text-retro-text">
      {{ cell }}
    </div>
  </PixelGrid>
</template>
