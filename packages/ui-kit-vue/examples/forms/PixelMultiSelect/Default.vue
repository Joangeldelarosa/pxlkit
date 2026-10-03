<script setup lang="ts">
import { ref } from 'vue';
import { PixelMultiSelect } from '@pxlkit/ui-kit-vue';

const OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'angular', label: 'Angular', disabled: true },
];
const value = ref(['react']);
</script>

<template>
  <PixelMultiSelect v-model="value" label="Frameworks" :options="OPTIONS" placeholder="Pick frameworks…" />
</template>
