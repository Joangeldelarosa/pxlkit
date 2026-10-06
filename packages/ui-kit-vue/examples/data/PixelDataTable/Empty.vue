<script setup lang="ts">
import { PixelDataTable, createColumnHelper, type ColumnDef } from '@pxlkit/ui-kit-vue';

type Row = { id: string; name: string; role: string; status: string };

const ch = createColumnHelper<Row>();

const columns: ColumnDef<Row, unknown>[] = [
  ch.accessor('name', { header: 'Name' }) as ColumnDef<Row, unknown>,
  ch.accessor('role', { header: 'Role' }) as ColumnDef<Row, unknown>,
  ch.accessor('status', { header: 'Status' }) as ColumnDef<Row, unknown>,
];
</script>

<template>
  <PixelDataTable :data="[]" :columns="columns">
    <template #empty-state><span>No records found.</span></template>
  </PixelDataTable>
</template>
