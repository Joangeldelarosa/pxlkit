<script setup lang="ts">
import { ref } from 'vue';
import { PixelCommand, type PixelCommandGroup } from '@pxlkit/ui-kit-vue';

const open = ref(false);
const close = () => {
  open.value = false;
};
const groups: PixelCommandGroup[] = [
  {
    heading: 'Recent',
    items: [
      { id: 'doc-1', label: 'Project roadmap', onSelect: close },
      { id: 'doc-2', label: 'Sprint notes', onSelect: close },
    ],
  },
];
</script>

<template>
  <button type="button" @click="open = true">Open linear palette</button>
  <PixelCommand v-model:open="open" surface="linear" empty-message="Nothing matches your search." :groups="groups" />
</template>
