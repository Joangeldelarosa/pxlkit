<script setup lang="ts">
import { PixelGrid } from '@pxlkit/ui-kit-vue';

const cells = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];
</script>

<template>
  <PixelGrid :cols="3" :gap="4">
    <div v-for="cell in cells" :key="cell" class="border border-retro-border bg-retro-surface p-3 text-sm text-retro-text">
      {{ cell }}
    </div>
  </PixelGrid>
</template>
