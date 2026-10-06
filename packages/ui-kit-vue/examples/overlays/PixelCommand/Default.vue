<script setup lang="ts">
import { ref } from 'vue';
import { PixelCommand, type PixelCommandGroup } from '@pxlkit/ui-kit-vue';

const open = ref(false);
const close = () => {
  open.value = false;
};
const groups: PixelCommandGroup[] = [
  {
    heading: 'Actions',
    items: [
      { id: 'new-file', label: 'New file', shortcut: 'Ctrl+N', onSelect: close },
      { id: 'open-file', label: 'Open file…', shortcut: 'Ctrl+O', onSelect: close },
      { id: 'save', label: 'Save', shortcut: 'Ctrl+S', onSelect: close },
    ],
  },
  {
    heading: 'Navigation',
    items: [
      { id: 'go-home', label: 'Go to home', keywords: ['dashboard', 'start'], onSelect: close },
      { id: 'go-settings', label: 'Go to settings', keywords: ['preferences', 'config'], onSelect: close },
    ],
  },
];
</script>

<template>
  <button type="button" @click="open = true">Open command palette</button>
  <PixelCommand v-model:open="open" :groups="groups" />
</template>
