<script setup lang="ts">
import { PixelSelect } from '@pxlkit/ui-kit-vue';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelSelect label="Small" :options="FRUITS" size="sm" placeholder="sm" />
    <PixelSelect label="Medium" :options="FRUITS" size="md" placeholder="md" />
    <PixelSelect label="Large" :options="FRUITS" size="lg" placeholder="lg" />
  </div>
</template>
