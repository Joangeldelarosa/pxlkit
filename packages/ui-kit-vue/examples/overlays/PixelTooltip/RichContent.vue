<script setup lang="ts">
import { PixelButton, PixelTooltip } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTooltip>
    <template #content>
      <span class="flex flex-col gap-0.5">
        <span class="font-semibold">Keyboard shortcut</span>
        <span class="opacity-80">Press ⌘K to open the command palette</span>
      </span>
    </template>
    <PixelButton>Hover for details</PixelButton>
  </PixelTooltip>
</template>
