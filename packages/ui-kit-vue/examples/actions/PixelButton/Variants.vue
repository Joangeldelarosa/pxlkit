<script setup lang="ts">
import { PixelButton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <PixelButton variant="solid">Solid</PixelButton>
    <PixelButton variant="soft">Soft</PixelButton>
    <PixelButton variant="outline">Outline</PixelButton>
    <PixelButton variant="ghost">Ghost</PixelButton>
  </div>
</template>
