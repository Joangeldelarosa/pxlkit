<script setup lang="ts">
import { PixelButton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <PixelButton>
      <template #icon-left><span aria-hidden="true" class="inline-block h-3.5 w-3.5">→</span></template>
      Leading
    </PixelButton>
    <PixelButton>
      Trailing
      <template #icon-right><span aria-hidden="true" class="inline-block h-3.5 w-3.5">→</span></template>
    </PixelButton>
    <PixelButton>
      <template #icon-left><span aria-hidden="true" class="inline-block h-3.5 w-3.5">→</span></template>
      Both
      <template #icon-right><span aria-hidden="true" class="inline-block h-3.5 w-3.5">→</span></template>
    </PixelButton>
  </div>
</template>
