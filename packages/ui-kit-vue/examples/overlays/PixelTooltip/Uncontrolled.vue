<script setup lang="ts">
import { PixelButton, PixelTooltip } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTooltip default-open label="Open by default" trigger="click">
    <PixelButton>Click to toggle</PixelButton>
  </PixelTooltip>
</template>
