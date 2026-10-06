<script setup lang="ts">
import { PixelToggle } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex items-center gap-2">
    <PixelToggle value="off" disabled :pressed="false">Disabled off</PixelToggle>
    <PixelToggle value="on" disabled pressed>Disabled on</PixelToggle>
  </div>
</template>
