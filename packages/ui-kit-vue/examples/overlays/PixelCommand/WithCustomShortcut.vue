<script setup lang="ts">
import { ref } from 'vue';
import { PixelCommand, type PixelCommandGroup } from '@pxlkit/ui-kit-vue';

const open = ref(false);
const close = () => {
  open.value = false;
};
const groups: PixelCommandGroup[] = [
  {
    heading: 'Commands',
    items: [
      { id: 'reload', label: 'Reload window', onSelect: close },
      { id: 'toggle-theme', label: 'Toggle theme', onSelect: close },
    ],
  },
];
</script>

<template>
  <button type="button" @click="open = true">Open (or press Ctrl+Shift+P)</button>
  <PixelCommand v-model:open="open" shortcut="mod+shift+p" placeholder="Run a command…" :groups="groups" />
</template>
