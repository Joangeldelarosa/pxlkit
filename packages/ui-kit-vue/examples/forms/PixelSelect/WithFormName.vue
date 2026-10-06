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
  <form>
    <PixelSelect
      label="Fruit"
      :options="FRUITS"
      name="fruit"
      default-value="cherry"
      hint="Value participates in native form submission"
    />
  </form>
</template>
