<script setup lang="ts">
import { h } from 'vue';
import { PixelNavigationMenu, type PixelNavigationMenuItem } from '@pxlkit/ui-kit-vue';

const items: PixelNavigationMenuItem[] = [
  { label: 'Home', href: '#home' },
  {
    label: 'Resources',
    content: () =>
      h('div', { class: 'grid gap-2 text-sm text-retro-text' }, [
        h('a', { href: '#guides', class: 'hover:underline' }, 'Guides'),
        h('a', { href: '#api', class: 'hover:underline' }, 'API Reference'),
      ]),
  },
];
</script>

<template>
  <PixelNavigationMenu :viewport="false" :items="items" />
</template>
