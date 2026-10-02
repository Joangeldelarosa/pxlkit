<script setup lang="ts">
import { PixelDropdown } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelDropdown
    label="Actions"
    :items="[
      { value: 'edit', label: 'Edit' },
      { value: 'duplicate', label: 'Duplicate' },
      { value: 'archive', label: 'Archive' },
    ]"
    @select="() => {}"
  />
</template>
