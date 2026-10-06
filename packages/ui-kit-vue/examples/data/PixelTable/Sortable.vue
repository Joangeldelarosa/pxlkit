<script setup lang="ts">
import { ref } from 'vue';
import { PixelTable, type PixelTableSortState } from '@pxlkit/ui-kit-vue';

const rows = [
  { id: '1', name: 'Alice', role: 'Engineer', status: 'active' },
  { id: '2', name: 'Bob', role: 'Designer', status: 'idle' },
  { id: '3', name: 'Carol', role: 'PM', status: 'active' },
];

const columns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'role', header: 'Role', sortable: true },
  { key: 'status', header: 'Status' },
];

const sort = ref<PixelTableSortState>({ key: 'name', dir: 'asc' });
</script>

<template>
  <PixelTable v-model:sort="sort" :columns="columns" :data="rows" />
</template>
