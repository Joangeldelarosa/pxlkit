<script setup lang="ts">
import { ref } from 'vue';
import { PixelPopover, PixelPopoverContent, PixelPopoverTrigger } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <PixelPopover v-model:open="open" side="right" align="start" :side-offset="12">
    <PixelPopoverTrigger>
      <button type="button">Right / start</button>
    </PixelPopoverTrigger>
    <PixelPopoverContent aria-labelledby="popover-side-title">
      <h3 id="popover-side-title" class="font-bold mb-1">Side placement</h3>
      <p class="text-sm">Anchored to the right of the trigger.</p>
    </PixelPopoverContent>
  </PixelPopover>
</template>
