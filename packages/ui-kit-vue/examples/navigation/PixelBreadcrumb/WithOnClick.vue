<script setup lang="ts">
import { PixelBreadcrumb, type PixelBreadcrumbItem } from '@pxlkit/ui-kit-vue';

const items: PixelBreadcrumbItem[] = [
  { label: 'Dashboard', onClick: () => {} },
  { label: 'Reports', onClick: () => {} },
  { label: 'Q4 Summary', active: true },
];
</script>

<template>
  <PixelBreadcrumb :items="items" />
</template>
