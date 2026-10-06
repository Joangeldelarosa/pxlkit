<script setup lang="ts">
import { PixelCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelCard title="Cover Story" description="Media slot sits above the header.">
    <template #media>
      <div class="h-24 w-full bg-gradient-to-br from-retro-cyan/40 to-retro-purple/40" />
    </template>
    <p>Card body.</p>
  </PixelCard>
</template>
