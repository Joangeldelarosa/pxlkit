<script setup lang="ts">
import { ref } from 'vue';
import { PixelNumberInput } from '@pxlkit/ui-kit-vue';

const value = ref(150);
</script>

<template>
  <PixelNumberInput
    v-model="value"
    label="Score"
    :min="0"
    :max="100"
    error="Score must be between 0 and 100"
    tone="red"
  />
</template>
