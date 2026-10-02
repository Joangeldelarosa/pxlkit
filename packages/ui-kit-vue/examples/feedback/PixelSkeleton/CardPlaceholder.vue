<script setup lang="ts">
import { PixelSkeleton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex w-72 flex-col gap-3 rounded border border-retro-border/60 p-4">
    <PixelSkeleton width="100%" height="8rem" />
    <PixelSkeleton width="80%" height="0.875rem" />
    <PixelSkeleton width="60%" height="0.75rem" />
  </div>
</template>
