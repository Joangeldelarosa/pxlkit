<script setup lang="ts">
import { PixelButton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <PixelButton loading>Saving</PixelButton>
    <PixelButton loading tone="cyan" variant="outline">Loading</PixelButton>
  </div>
</template>
