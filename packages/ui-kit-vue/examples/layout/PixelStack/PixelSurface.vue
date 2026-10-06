<script setup lang="ts">
import { PixelStack } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelStack surface="pixel" :gap="4">
    <div class="text-sm text-retro-muted">Surface-aware item</div>
    <div class="text-sm text-retro-muted">Picks up pixel transition</div>
  </PixelStack>
</template>
