<script setup lang="ts">
import { ref } from 'vue';
import { PixelSelect } from '@pxlkit/ui-kit-vue';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];
const value = ref('banana');
</script>

<template>
  <PixelSelect v-model="value" label="Controlled fruit" :options="FRUITS" tone="cyan" />
</template>
