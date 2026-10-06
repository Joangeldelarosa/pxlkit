<script setup lang="ts">
import { h } from 'vue';
import { PixelTabs, type TabItem } from '@pxlkit/ui-kit-vue';

const items: TabItem[] = [
  { id: 'overview', label: 'Overview', content: () => h('p', 'High-level summary of the project.') },
  { id: 'activity', label: 'Activity', content: () => h('p', 'Recent events and commits.') },
  { id: 'settings', label: 'Settings', content: () => h('p', 'Configuration for this workspace.') },
];
</script>

<template>
  <PixelTabs :items="items" default-value="overview" activation-mode="manual" aria-label="Manual activation tabs" />
</template>
