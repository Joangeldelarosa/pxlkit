<script setup lang="ts">
import { ref } from 'vue';
import { PixelCombobox } from '@pxlkit/ui-kit-vue';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
];
const value = ref('cherry');
</script>

<template>
  <PixelCombobox v-model="value" label="Controlled fruit" :options="FRUITS" />
</template>
