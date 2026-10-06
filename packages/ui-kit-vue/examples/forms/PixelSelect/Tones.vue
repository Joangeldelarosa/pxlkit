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
    <PixelSelect label="Neutral" :options="FRUITS" tone="neutral" default-value="apple" />
    <PixelSelect label="Cyan" :options="FRUITS" tone="cyan" default-value="apple" />
    <PixelSelect label="Green" :options="FRUITS" tone="green" default-value="apple" />
    <PixelSelect label="Gold" :options="FRUITS" tone="gold" default-value="apple" />
    <PixelSelect label="Purple" :options="FRUITS" tone="purple" default-value="apple" />
    <PixelSelect label="Pink" :options="FRUITS" tone="pink" default-value="apple" />
  </div>
</template>
