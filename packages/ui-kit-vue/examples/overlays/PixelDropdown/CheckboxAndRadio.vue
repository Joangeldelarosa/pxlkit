<script setup lang="ts">
import { PixelDropdown, type DropdownOption } from '@pxlkit/ui-kit-vue';

const items: DropdownOption[] = [
  { value: 'g1', label: 'Show', kind: 'header' },
  { value: 'grid', label: 'Grid lines', kind: 'checkbox', checked: true },
  { value: 'ruler', label: 'Ruler', kind: 'checkbox', checked: false },
  { value: 'sep', label: '', kind: 'separator' },
  { value: 'g2', label: 'Density', kind: 'header' },
  { value: 'compact', label: 'Compact', kind: 'radio', checked: false },
  { value: 'cozy', label: 'Cozy', kind: 'radio', checked: true },
  { value: 'spacious', label: 'Spacious', kind: 'radio', checked: false },
];
</script>

<template>
  <PixelDropdown label="View" :items="items" @select="() => {}" />
</template>
