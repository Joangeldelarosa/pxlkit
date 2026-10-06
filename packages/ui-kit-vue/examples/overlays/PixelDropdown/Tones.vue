<script setup lang="ts">
import { PixelDropdown } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap items-start gap-4">
    <PixelDropdown label="Neutral" tone="neutral" :items="[{ value: 'a', label: 'Option A' }]" />
    <PixelDropdown label="Cyan" tone="cyan" :items="[{ value: 'a', label: 'Option A' }]" />
    <PixelDropdown label="Green" tone="green" :items="[{ value: 'a', label: 'Option A' }]" />
    <PixelDropdown label="Red" tone="red" :items="[{ value: 'a', label: 'Option A' }]" />
  </div>
</template>
