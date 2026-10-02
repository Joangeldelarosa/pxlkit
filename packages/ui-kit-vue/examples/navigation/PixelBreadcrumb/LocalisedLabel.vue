<script setup lang="ts">
import { PixelBreadcrumb, type PixelBreadcrumbItem } from '@pxlkit/ui-kit-vue';

const trail: PixelBreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Docs', href: '/docs' },
  { label: 'Components', href: '/docs/components' },
  { label: 'Breadcrumb', active: true },
];
</script>

<template>
  <PixelBreadcrumb :items="trail" aria-label="Ruta de navegación" />
</template>
