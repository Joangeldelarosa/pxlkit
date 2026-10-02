<script setup lang="ts">
import { PixelTextarea } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelTextarea label="Neutral" tone="neutral" default-value="Neutral tone" />
    <PixelTextarea label="Green" tone="green" default-value="Green tone" />
    <PixelTextarea label="Cyan" tone="cyan" default-value="Cyan tone" />
    <PixelTextarea label="Gold" tone="gold" default-value="Gold tone" />
    <PixelTextarea label="Red" tone="red" default-value="Red tone" />
    <PixelTextarea label="Purple" tone="purple" default-value="Purple tone" />
    <PixelTextarea label="Pink" tone="pink" default-value="Pink tone" />
  </div>
</template>
