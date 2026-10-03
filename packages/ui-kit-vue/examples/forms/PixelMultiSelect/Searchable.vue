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
const value = ref<string[]>([]);
</script>

<template>
  <PixelMultiSelect v-model="value" label="Frameworks" hint="Type to filter" :options="OPTIONS" searchable clearable />
</template>
