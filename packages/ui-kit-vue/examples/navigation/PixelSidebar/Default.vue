<script setup lang="ts">
import { PixelSidebar, type PixelSidebarSectionProps } from '@pxlkit/ui-kit-vue';

const sections: PixelSidebarSectionProps[] = [
  {
    title: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Dashboard', active: true },
      { id: 'projects', label: 'Projects', badge: { label: '4', tone: 'cyan' } },
      { id: 'tasks', label: 'Tasks' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'settings', label: 'Settings' },
      { id: 'billing', label: 'Billing', badge: { label: 'NEW', tone: 'green' } },
    ],
  },
];
</script>

<template>
  <div style="height: 320px">
    <PixelSidebar :sections="sections">
      <template #header><span class="text-xs text-retro-text">pxlkit</span></template>
    </PixelSidebar>
  </div>
</template>
