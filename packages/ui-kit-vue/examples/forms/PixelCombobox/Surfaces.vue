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
    <PixelCombobox label="Pixel" :options="FRUITS" surface="pixel" placeholder="pixel surface" />
    <PixelCombobox label="Linear" :options="FRUITS" surface="linear" placeholder="linear surface" />
  </div>
</template>
