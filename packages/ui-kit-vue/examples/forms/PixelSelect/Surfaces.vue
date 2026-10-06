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
    <PixelSelect label="Pixel" :options="FRUITS" surface="pixel" placeholder="pixel surface" />
    <PixelSelect label="Linear" :options="FRUITS" surface="linear" placeholder="linear surface" />
  </div>
</template>
