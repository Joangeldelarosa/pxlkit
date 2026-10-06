<script setup lang="ts">
import { PixelInputGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelInputGroup size="sm" aria-label="Small group">
      <input aria-label="First segment" value="small" class="bg-transparent px-2 outline-none" />
      <input aria-label="Second segment" value="size" class="bg-transparent px-2 outline-none" />
    </PixelInputGroup>
    <PixelInputGroup size="md" aria-label="Medium group">
      <input aria-label="First segment" value="medium" class="bg-transparent px-2 outline-none" />
      <input aria-label="Second segment" value="size" class="bg-transparent px-2 outline-none" />
    </PixelInputGroup>
    <PixelInputGroup size="lg" aria-label="Large group">
      <input aria-label="First segment" value="large" class="bg-transparent px-2 outline-none" />
      <input aria-label="Second segment" value="size" class="bg-transparent px-2 outline-none" />
    </PixelInputGroup>
  </div>
</template>
