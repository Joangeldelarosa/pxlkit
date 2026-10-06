<script setup lang="ts">
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
</script>

<template>
  <PixelCombobox label="Fruit" :options="FRUITS" placeholder="Type 'xyz'" empty-message="No fruits match your filter" />
</template>
