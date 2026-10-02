<script setup lang="ts">
import { PixelSkeleton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex items-center gap-3">
    <PixelSkeleton width="2.5rem" height="2.5rem" rounded />
    <div class="flex flex-col gap-1.5">
      <PixelSkeleton width="8rem" height="0.75rem" />
      <PixelSkeleton width="5rem" height="0.75rem" />
    </div>
  </div>
</template>
