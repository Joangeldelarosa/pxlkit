<script setup lang="ts">
import { PixelButton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <PixelButton disabled>Disabled</PixelButton>
    <PixelButton disabled variant="outline">Disabled outline</PixelButton>
  </div>
</template>
