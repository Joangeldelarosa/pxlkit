<script setup lang="ts">
import { PixelBareInput } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBareInput type="number" :min="0" :max="100" :step="1" :default-value="42" aria-label="number-input" />
</template>
