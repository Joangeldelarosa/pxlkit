<script setup lang="ts">
import { PixelInputGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelInputGroup surface="pixel" aria-label="Pixel surface group">
      <input aria-label="First segment" value="pixel" class="bg-transparent px-2 outline-none" />
      <input aria-label="Second segment" value="surface" class="bg-transparent px-2 outline-none" />
    </PixelInputGroup>
    <PixelInputGroup surface="linear" aria-label="Linear surface group">
      <input aria-label="First segment" value="linear" class="bg-transparent px-2 outline-none" />
      <input aria-label="Second segment" value="surface" class="bg-transparent px-2 outline-none" />
    </PixelInputGroup>
  </div>
</template>
