<script setup lang="ts">
import { PixelDropdown } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelDropdown label="Unavailable" disabled :items="[{ value: 'a', label: 'Option A' }]" />
</template>
