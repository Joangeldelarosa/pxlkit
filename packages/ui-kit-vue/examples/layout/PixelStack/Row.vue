<script setup lang="ts">
import { PixelStack } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelStack direction="row" :gap="3" align="center">
    <div class="text-sm text-retro-muted">Left</div>
    <div class="text-sm text-retro-muted">Center</div>
    <div class="text-sm text-retro-muted">Right</div>
  </PixelStack>
</template>
