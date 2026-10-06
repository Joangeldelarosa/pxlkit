<script setup lang="ts">
import { PixelDropdown, type DropdownOption } from '@pxlkit/ui-kit-vue';

const items: DropdownOption[] = [
  { value: 'undo', label: 'Undo', shortcut: 'Ctrl+Z' },
  { value: 'redo', label: 'Redo', shortcut: 'Ctrl+Y', disabled: true },
  { value: 'sep', label: '', kind: 'separator' },
  { value: 'cut', label: 'Cut' },
  { value: 'copy', label: 'Copy' },
  { value: 'paste', label: 'Paste', disabled: true },
];
</script>

<template>
  <PixelDropdown label="Edit" :items="items" @select="() => {}" />
</template>
