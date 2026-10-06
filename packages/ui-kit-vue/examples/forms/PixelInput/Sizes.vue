<script setup lang="ts">
import { PixelInput } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelInput label="Small" size="sm" placeholder="sm" />
    <PixelInput label="Medium" size="md" placeholder="md" />
    <PixelInput label="Large" size="lg" placeholder="lg" />
  </div>
</template>
