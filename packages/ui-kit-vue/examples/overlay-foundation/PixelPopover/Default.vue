<script setup lang="ts">
import { ref } from 'vue';
import { PixelPopover, PixelPopoverContent, PixelPopoverTrigger } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <PixelPopover v-model:open="open">
    <PixelPopoverTrigger>
      <button type="button">Open popover</button>
    </PixelPopoverTrigger>
    <PixelPopoverContent aria-labelledby="popover-title">
      <h3 id="popover-title" class="font-bold mb-1">Popover</h3>
      <p class="text-sm">Floating content anchored to the trigger.</p>
    </PixelPopoverContent>
  </PixelPopover>
</template>
