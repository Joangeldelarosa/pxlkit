<script setup lang="ts">
import { ref } from 'vue';
import { PixelNumberInput } from '@pxlkit/ui-kit-vue';

const value = ref(42);
</script>

<template>
  <PixelNumberInput v-model="value" label="Age" hide-controls :min="0" :max="120" />
</template>
