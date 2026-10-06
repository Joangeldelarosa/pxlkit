<script setup lang="ts">
import { PixelFlicker } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelFlicker trigger="hover" :repeat="1">
    <span>Hover me</span>
  </PixelFlicker>
</template>
