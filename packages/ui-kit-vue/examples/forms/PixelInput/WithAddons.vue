<script setup lang="ts">
import { PixelInput } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelInput label="Website" default-value="pxlkit">
    <template #addon-left><span class="text-xs">https://</span></template>
    <template #addon-right><span class="text-xs">.xyz</span></template>
  </PixelInput>
</template>
