<script setup lang="ts">
import { PixelDropdown } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelDropdown
    label="File"
    :items="[
      { value: 'new', label: 'New', shortcut: 'Ctrl+N' },
      { value: 'open', label: 'Open…', shortcut: 'Ctrl+O' },
      { value: 'save', label: 'Save', shortcut: 'Ctrl+S' },
    ]"
    @select="() => {}"
  />
</template>
