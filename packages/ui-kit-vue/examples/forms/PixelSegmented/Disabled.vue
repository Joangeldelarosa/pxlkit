<script setup lang="ts">
import { PixelSegmented } from '@pxlkit/ui-kit-vue';

const VIEWS = [
  { value: 'grid', label: 'Grid' },
  { value: 'list', label: 'List' },
  { value: 'kanban', label: 'Kanban' },
];
</script>

<template>
  <PixelSegmented label="View (locked)" model-value="grid" :options="VIEWS" disabled />
</template>
