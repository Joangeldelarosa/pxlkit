<script setup lang="ts">
import { ref } from 'vue';
import { PixelPopover, PixelPopoverArrow, PixelPopoverContent, PixelPopoverTrigger } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <PixelPopover v-model:open="open" side="bottom" align="center">
    <PixelPopoverTrigger>
      <button type="button">With arrow</button>
    </PixelPopoverTrigger>
    <PixelPopoverContent aria-labelledby="popover-arrow-title">
      <h3 id="popover-arrow-title" class="font-bold mb-1">Pointed popover</h3>
      <p class="text-sm">Includes a decorative arrow.</p>
      <PixelPopoverArrow />
    </PixelPopoverContent>
  </PixelPopover>
</template>
