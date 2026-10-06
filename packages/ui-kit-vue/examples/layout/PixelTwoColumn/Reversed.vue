<script setup lang="ts">
import { PixelTwoColumn } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTwoColumn ratio="70/30" reverse>
    <template #left><div class="text-sm text-retro-muted">Logical left</div></template>
    <template #right><div class="text-sm text-retro-muted">Visually first</div></template>
  </PixelTwoColumn>
</template>
