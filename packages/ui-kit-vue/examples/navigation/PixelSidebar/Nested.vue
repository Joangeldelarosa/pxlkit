<script setup lang="ts">
import { PixelSidebar, type PixelSidebarSectionProps } from '@pxlkit/ui-kit-vue';

const sections: PixelSidebarSectionProps[] = [
  {
    title: 'Library',
    items: [
      {
        id: 'components',
        label: 'Components',
        active: true,
        nested: [
          { id: 'buttons', label: 'Buttons' },
          { id: 'forms', label: 'Forms' },
          { id: 'navigation', label: 'Navigation' },
        ],
      },
      { id: 'tokens', label: 'Tokens' },
    ],
  },
];
</script>

<template>
  <div style="height: 320px">
    <PixelSidebar :sections="sections" />
  </div>
</template>
