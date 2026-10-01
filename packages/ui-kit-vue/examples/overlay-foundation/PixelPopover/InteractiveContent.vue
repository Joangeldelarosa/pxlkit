<script setup lang="ts">
import { ref } from 'vue';
import { PixelPopover, PixelPopoverContent, PixelPopoverTrigger } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <PixelPopover v-model:open="open" align="start">
    <PixelPopoverTrigger>
      <button type="button">Rename layer</button>
    </PixelPopoverTrigger>
    <PixelPopoverContent aria-labelledby="popover-form-title" class="w-64">
      <h3 id="popover-form-title" class="font-bold mb-2">Rename layer</h3>
      <label for="popover-form-name" class="block text-sm mb-1">Name</label>
      <input
        id="popover-form-name"
        value="Background"
        class="w-full mb-3 px-2 py-1 text-sm bg-retro-surface border border-retro-border text-retro-text"
      />
      <button type="button" @click="open = false">Save</button>
    </PixelPopoverContent>
  </PixelPopover>
</template>
