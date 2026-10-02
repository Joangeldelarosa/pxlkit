<script setup lang="ts">
import { PixelKbd } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex items-center gap-1 text-xs">
    <PixelKbd>Ctrl</PixelKbd>
    <span aria-hidden="true">+</span>
    <PixelKbd>K</PixelKbd>
  </div>
</template>
