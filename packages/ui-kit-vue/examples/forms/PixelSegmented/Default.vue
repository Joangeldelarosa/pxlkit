<script setup lang="ts">
import { ref } from 'vue';
import { PixelSegmented } from '@pxlkit/ui-kit-vue';

const VIEWS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'kanban', label: 'Kanban' },
];
const value = ref('grid');
</script>

<template>
  <PixelSegmented v-model="value" label="View" :options="VIEWS" />
</template>
