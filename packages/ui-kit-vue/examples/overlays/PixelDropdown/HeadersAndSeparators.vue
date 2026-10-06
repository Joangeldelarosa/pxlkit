<script setup lang="ts">
import { PixelDropdown, type DropdownOption } from '@pxlkit/ui-kit-vue';

const items: DropdownOption[] = [
  { value: 'h1', label: 'Profile', kind: 'header' },
  { value: 'view', label: 'View profile' },
  { value: 'edit', label: 'Edit profile' },
  { value: 'sep1', label: '', kind: 'separator' },
  { value: 'h2', label: 'Danger Zone', kind: 'header' },
  { value: 'delete', label: 'Delete account', tone: 'red' },
];
</script>

<template>
  <PixelDropdown label="Account" :items="items" @select="() => {}" />
</template>
