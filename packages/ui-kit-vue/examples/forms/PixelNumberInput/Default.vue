<script setup lang="ts">
import { ref } from 'vue';
import { PixelNumberInput } from '@pxlkit/ui-kit-vue';

const value = ref(5);
</script>

<template>
  <PixelNumberInput v-model="value" label="Quantity" :min="0" :max="100" />
</template>
