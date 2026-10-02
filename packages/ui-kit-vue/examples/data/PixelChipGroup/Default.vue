<script setup lang="ts">
import { ref } from 'vue';
import { PixelChip, PixelChipGroup } from '@pxlkit/ui-kit-vue';

const value = ref(['react']);
</script>

<template>
  <PixelChipGroup v-model="value" aria-label="Frameworks">
    <PixelChip value="react" label="React" tone="cyan" />
    <PixelChip value="vue" label="Vue" tone="green" />
    <PixelChip value="svelte" label="Svelte" tone="gold" />
  </PixelChipGroup>
</template>
