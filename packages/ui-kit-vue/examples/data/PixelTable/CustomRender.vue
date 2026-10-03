<script setup lang="ts">
import { h } from 'vue';
import { PixelTable, type PixelTableColumn } from '@pxlkit/ui-kit-vue';

type Row = { id: string; name: string; role: string; status: string };

const rows: Row[] = [
  { id: '1', name: 'Alice', role: 'Engineer', status: 'active' },
  { id: '2', name: 'Bob', role: 'Designer', status: 'idle' },
  { id: '3', name: 'Carol', role: 'PM', status: 'active' },
];

const columns: PixelTableColumn<Row>[] = [
  { key: 'name', header: 'Name' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => h('span', { style: { textTransform: 'uppercase' } }, row.status),
  },
];
</script>

<template>
  <PixelTable :columns="columns" :data="rows" />
</template>
