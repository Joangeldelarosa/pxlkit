<script setup lang="ts">
import { PixelSelect } from '@pxlkit/ui-kit-vue';

const REGIONS = [
  { value: 'us', label: 'United States' },
  { value: 've', label: 'Venezuela' },
  { value: 'es', label: 'Spain' },
  { value: 'mx', label: 'Mexico' },
];
</script>

<template>
  <PixelSelect label="Region" :options="REGIONS" name="region" required placeholder="Required field" />
</template>
