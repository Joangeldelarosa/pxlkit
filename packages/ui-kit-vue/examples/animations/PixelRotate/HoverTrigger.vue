<script setup lang="ts">
import { PixelRotate } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelRotate trigger="hover" :repeat="1" :duration="900">
    <span>Hover me</span>
  </PixelRotate>
</template>
