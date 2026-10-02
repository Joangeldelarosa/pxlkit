<script setup lang="ts">
import { PixelBreadcrumb, type PixelBreadcrumbItem } from '@pxlkit/ui-kit-vue';

const items: PixelBreadcrumbItem[] = [
  { label: 'Org', href: '/' },
  { label: 'Workspaces', href: '/workspaces' },
  { label: 'Engineering', href: '/workspaces/eng' },
  { label: 'Projects', href: '/workspaces/eng/projects' },
  { label: 'pxlkit', href: '/workspaces/eng/projects/pxlkit' },
  { label: 'Settings', active: true },
];
</script>

<template>
  <PixelBreadcrumb :items="items" />
</template>
