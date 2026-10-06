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
  <div class="flex flex-col gap-3">
    <PixelCombobox label="Small" :options="FRUITS" size="sm" placeholder="sm" />
    <PixelCombobox label="Medium" :options="FRUITS" size="md" placeholder="md" />
    <PixelCombobox label="Large" :options="FRUITS" size="lg" placeholder="lg" />
  </div>
</template>
