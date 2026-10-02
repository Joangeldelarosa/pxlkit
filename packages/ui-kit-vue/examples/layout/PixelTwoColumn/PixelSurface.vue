<script setup lang="ts">
import { PixelTwoColumn } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTwoColumn surface="pixel" ratio="50/50">
    <template #left><div class="text-sm text-retro-muted">Surface-aware left</div></template>
    <template #right><div class="text-sm text-retro-muted">Surface-aware right</div></template>
  </PixelTwoColumn>
</template>
