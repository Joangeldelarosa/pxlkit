<script setup lang="ts">
import { PixelTable } from '@pxlkit/ui-kit-vue';

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status' },
];
</script>

<template>
  <PixelTable :columns="columns" :data="[]">
    <template #empty-state><span>No records found.</span></template>
  </PixelTable>
</template>
