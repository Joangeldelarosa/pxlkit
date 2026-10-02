<script setup lang="ts">
import { PixelGrid } from '@pxlkit/ui-kit-vue';

const cells = ['1', '2', '3', '4'];
</script>

<template>
  <PixelGrid :cols="{ base: 1, sm: 2, md: 3, lg: 4 }" :gap="4">
    <div v-for="cell in cells" :key="cell" class="border border-retro-border bg-retro-surface p-3 text-sm text-retro-text">
      {{ cell }}
    </div>
  </PixelGrid>
</template>
