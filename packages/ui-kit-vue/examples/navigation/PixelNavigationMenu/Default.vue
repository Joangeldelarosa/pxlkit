<script setup lang="ts">
import { h } from 'vue';
import { PixelNavigationMenu, type PixelNavigationMenuItem } from '@pxlkit/ui-kit-vue';

const items: PixelNavigationMenuItem[] = [
  { label: 'Home', href: '#home' },
  {
    label: 'Products',
    content: () =>
      h('div', { class: 'grid gap-2 text-sm text-retro-text' }, [
        h('a', { href: '#analytics', class: 'hover:underline' }, 'Analytics'),
        h('a', { href: '#dashboard', class: 'hover:underline' }, 'Dashboard'),
        h('a', { href: '#reports', class: 'hover:underline' }, 'Reports'),
      ]),
  },
  { label: 'Docs', href: '#docs' },
  { label: 'Pricing', href: '#pricing' },
];
</script>

<template>
  <PixelNavigationMenu :items="items" />
</template>
