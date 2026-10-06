<script setup lang="ts">
import { PixelMenubar, type PixelMenubarMenu } from '@pxlkit/ui-kit-vue';

const menus: PixelMenubarMenu[] = [
  {
    label: 'Tools',
    items: [
      {
        value: 'export',
        label: 'Export As',
        submenu: [
          { value: 'png', label: 'PNG' },
          { value: 'svg', label: 'SVG' },
          { value: 'gif', label: 'GIF' },
        ],
      },
      {
        value: 'convert',
        label: 'Convert',
        submenu: [
          { value: 'palette', label: 'Reduce Palette' },
          { value: 'grayscale', label: 'Grayscale' },
        ],
      },
    ],
  },
];
</script>

<template>
  <PixelMenubar :menus="menus" />
</template>
