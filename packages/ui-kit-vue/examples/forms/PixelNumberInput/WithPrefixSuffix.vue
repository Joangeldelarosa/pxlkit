<script setup lang="ts">
import { ref } from 'vue';
import { PixelNumberInput } from '@pxlkit/ui-kit-vue';

const value = ref(19.99);
</script>

<template>
  <PixelNumberInput
    v-model="value"
    label="Price"
    prefix="$"
    suffix="USD"
    :precision="2"
    :step="0.01"
    :min="0"
  />
</template>
