<script setup lang="ts">
import { PixelScrollArea } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelScrollArea aria-label="Always-visible scrollbar" type="always" :max-height="140" offset-scrollbars>
    <div class="space-y-2 p-3">
      <p v-for="i in 10" :key="i" class="text-sm text-retro-muted">Row {{ i }}</p>
    </div>
  </PixelScrollArea>
</template>
