<script setup lang="ts">
import { PixelBadge } from '@pxlkit/ui-kit-vue';

const dot = { width: '6px', height: '6px', borderRadius: '9999px', background: 'currentColor', display: 'inline-block' };
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <PixelBadge tone="green">
      <template #icon-left><span aria-hidden="true" :style="dot" /></template>
      online
    </PixelBadge>
    <PixelBadge tone="red">
      <template #icon-left><span aria-hidden="true" :style="dot" /></template>
      error
    </PixelBadge>
    <PixelBadge tone="gold">
      <template #icon-left><span aria-hidden="true" :style="dot" /></template>
      warn
    </PixelBadge>
  </div>
</template>
