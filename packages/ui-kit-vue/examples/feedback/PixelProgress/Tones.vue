<script setup lang="ts">
import { PixelProgress } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="space-y-3">
    <PixelProgress :value="70" tone="neutral" label="Neutral" />
    <PixelProgress :value="70" tone="green" label="Green" />
    <PixelProgress :value="70" tone="cyan" label="Cyan" />
    <PixelProgress :value="70" tone="gold" label="Gold" />
    <PixelProgress :value="70" tone="red" label="Red" />
    <PixelProgress :value="70" tone="purple" label="Purple" />
    <PixelProgress :value="70" tone="pink" label="Pink" />
  </div>
</template>
