<script setup lang="ts">
import { PixelProgress } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="space-y-3">
    <PixelProgress :value="-25" label="Below 0 (clamped to 0)" />
    <PixelProgress :value="150" label="Above 100 (clamped to 100)" />
  </div>
</template>
