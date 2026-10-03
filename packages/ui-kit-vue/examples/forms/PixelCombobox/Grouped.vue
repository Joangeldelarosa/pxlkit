<script setup lang="ts">
import { PixelCombobox } from '@pxlkit/ui-kit-vue';

const GROUPED = [
  { value: 'us', label: 'United States', group: 'Americas' },
  { value: 've', label: 'Venezuela', group: 'Americas' },
  { value: 'mx', label: 'Mexico', group: 'Americas' },
  { value: 'es', label: 'Spain', group: 'Europe' },
  { value: 'fr', label: 'France', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
  { value: 'jp', label: 'Japan', group: 'Asia' },
  { value: 'kr', label: 'South Korea', group: 'Asia' },
];
</script>

<template>
  <PixelCombobox label="Country" :options="GROUPED" placeholder="Pick a country" />
</template>
