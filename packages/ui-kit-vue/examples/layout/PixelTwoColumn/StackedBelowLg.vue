<script setup lang="ts">
import { PixelTwoColumn } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTwoColumn stack-below="lg" align="center">
    <template #left><div class="text-sm text-retro-muted">Stacks below lg</div></template>
    <template #right><div class="text-sm text-retro-muted">Side-by-side at lg+</div></template>
  </PixelTwoColumn>
</template>
