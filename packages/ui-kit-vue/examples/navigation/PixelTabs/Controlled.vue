<script setup lang="ts">
import { h, ref } from 'vue';
import { PixelTabs, type TabItem } from '@pxlkit/ui-kit-vue';

const items: TabItem[] = [
  { id: 'overview', label: 'Overview', content: () => h('p', 'High-level summary of the project.') },
  { id: 'activity', label: 'Activity', content: () => h('p', 'Recent events and commits.') },
  { id: 'settings', label: 'Settings', content: () => h('p', 'Configuration for this workspace.') },
];

const active = ref('activity');
</script>

<template>
  <div class="space-y-2">
    <PixelTabs v-model="active" :items="items" />
    <p class="text-xs text-retro-muted">Active tab: {{ active }}</p>
  </div>
</template>
