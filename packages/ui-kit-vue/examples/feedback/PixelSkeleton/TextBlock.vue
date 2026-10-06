<script setup lang="ts">
import { PixelSkeleton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-2">
    <PixelSkeleton width="14rem" height="0.75rem" />
    <PixelSkeleton width="11rem" height="0.75rem" />
    <PixelSkeleton width="9rem" height="0.75rem" />
  </div>
</template>
