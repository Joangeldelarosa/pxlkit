<script setup lang="ts">
import { PixelChip } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <PixelChip label="Soft" variant="soft" tone="cyan" />
    <PixelChip label="Solid" variant="solid" tone="cyan" />
    <PixelChip label="Outline" variant="outline" tone="cyan" />
    <PixelChip label="Ghost" variant="ghost" tone="cyan" />
  </div>
</template>
