<script setup lang="ts">
import { PixelBreadcrumb, type PixelBreadcrumbItem } from '@pxlkit/ui-kit-vue';

const items: PixelBreadcrumbItem[] = [{ label: 'Library' }, { label: 'Albums' }, { label: 'Photos', active: true }];
</script>

<template>
  <PixelBreadcrumb :items="items" />
</template>
