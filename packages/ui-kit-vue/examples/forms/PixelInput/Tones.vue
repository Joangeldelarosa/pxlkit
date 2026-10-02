<script setup lang="ts">
import { PixelInput } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelInput label="Neutral" tone="neutral" default-value="neutral" />
    <PixelInput label="Cyan" tone="cyan" default-value="cyan" />
    <PixelInput label="Green" tone="green" default-value="green" />
    <PixelInput label="Gold" tone="gold" default-value="gold" />
    <PixelInput label="Purple" tone="purple" default-value="purple" />
    <PixelInput label="Pink" tone="pink" default-value="pink" />
  </div>
</template>
