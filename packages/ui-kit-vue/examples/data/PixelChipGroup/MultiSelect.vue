<script setup lang="ts">
import { ref } from 'vue';
import { PixelChip, PixelChipGroup } from '@pxlkit/ui-kit-vue';

const value = ref(['ts', 'rust']);
</script>

<template>
  <PixelChipGroup v-model="value" multiple aria-label="Languages">
    <PixelChip value="ts" label="TypeScript" tone="cyan" />
    <PixelChip value="rust" label="Rust" tone="gold" />
    <PixelChip value="go" label="Go" tone="green" />
    <PixelChip value="py" label="Python" tone="purple" />
  </PixelChipGroup>
</template>
