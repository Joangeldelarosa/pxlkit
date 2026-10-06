<script setup lang="ts">
import { PixelDataTable, createColumnHelper, type ColumnDef } from '@pxlkit/ui-kit-vue';

type Row = { id: string; name: string; role: string; status: string };

const rows: Row[] = [
  { id: '1', name: 'Alice', role: 'Engineer', status: 'active' },
  { id: '2', name: 'Bob', role: 'Designer', status: 'idle' },
  { id: '3', name: 'Carol', role: 'PM', status: 'active' },
  { id: '4', name: 'Dan', role: 'Engineer', status: 'active' },
  { id: '5', name: 'Eve', role: 'Designer', status: 'idle' },
];

const ch = createColumnHelper<Row>();

const columns: ColumnDef<Row, unknown>[] = [
  ch.accessor('name', { header: 'Name' }) as ColumnDef<Row, unknown>,
  ch.accessor('role', { header: 'Role' }) as ColumnDef<Row, unknown>,
  ch.accessor('status', { header: 'Status' }) as ColumnDef<Row, unknown>,
];
</script>

<template>
  <PixelDataTable :data="rows" :columns="columns" />
</template>
