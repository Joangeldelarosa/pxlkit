<script setup lang="ts">
import { PixelNavigationMenu, type PixelNavigationMenuItem } from '@pxlkit/ui-kit-vue';

const items: PixelNavigationMenuItem[] = [
  { label: 'Overview', href: '#overview' },
  { label: 'Settings', href: '#settings' },
  { label: 'Billing', href: '#billing' },
];
</script>

<template>
  <PixelNavigationMenu orientation="vertical" :items="items" />
</template>
