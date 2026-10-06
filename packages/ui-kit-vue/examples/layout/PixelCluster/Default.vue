<script setup lang="ts">
import { PixelCluster } from '@pxlkit/ui-kit-vue';

const tags = ['react', 'typescript', 'tailwind', 'next', 'vite'];
</script>

<template>
  <PixelCluster>
    <span v-for="tag in tags" :key="tag" class="rounded border border-retro-border px-2 py-1 text-xs text-retro-text">
      {{ tag }}
    </span>
  </PixelCluster>
</template>
