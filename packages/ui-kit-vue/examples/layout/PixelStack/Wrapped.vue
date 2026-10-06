<script setup lang="ts">
import { PixelStack } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelStack direction="row" :gap="2" wrap>
    <div class="text-sm text-retro-muted">Tag A</div>
    <div class="text-sm text-retro-muted">Tag B</div>
    <div class="text-sm text-retro-muted">Tag C</div>
    <div class="text-sm text-retro-muted">Tag D</div>
  </PixelStack>
</template>
