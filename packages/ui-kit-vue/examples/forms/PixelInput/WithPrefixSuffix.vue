<script setup lang="ts">
import { PixelInput } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelInput label="Amount" default-value="42">
      <template #prefix><span class="text-xs">$</span></template>
      <template #suffix><span class="text-xs">USD</span></template>
    </PixelInput>
    <PixelInput label="Search" placeholder="Find anything">
      <template #prefix><span aria-hidden="true">?</span></template>
    </PixelInput>
  </div>
</template>
