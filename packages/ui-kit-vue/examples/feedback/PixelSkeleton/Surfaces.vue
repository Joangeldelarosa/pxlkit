<script setup lang="ts">
import { PixelSkeleton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelSkeleton surface="linear" width="14rem" height="1rem" />
    <PixelSkeleton surface="pixel" width="14rem" height="1rem" />
  </div>
</template>
