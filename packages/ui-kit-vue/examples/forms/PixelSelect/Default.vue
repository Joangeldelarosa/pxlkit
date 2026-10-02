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
  <PixelSelect label="Fruit" :options="FRUITS" placeholder="Pick a fruit" hint="Choose your favorite" />
</template>
