<script setup lang="ts">
import { PixelTable } from '@pxlkit/ui-kit-vue';

const rows = [
  { id: '1', name: 'Alice', role: 'Engineer', status: 'active' },
  { id: '2', name: 'Bob', role: 'Designer', status: 'idle' },
  { id: '3', name: 'Carol', role: 'PM', status: 'active' },
];

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
];
</script>

<template>
  <PixelTable :columns="columns" :data="rows" />
</template>
