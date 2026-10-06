<script setup lang="ts">
import { ref } from 'vue';
import { PixelChip, PixelChipGroup } from '@pxlkit/ui-kit-vue';

const a = ref(['one']);
const b = ref(['one']);
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelChipGroup v-model="a" surface="pixel" aria-label="Pixel surface">
      <PixelChip value="one" label="One" tone="green" />
      <PixelChip value="two" label="Two" tone="green" />
    </PixelChipGroup>
    <PixelChipGroup v-model="b" surface="linear" aria-label="Linear surface">
      <PixelChip value="one" label="One" tone="cyan" />
      <PixelChip value="two" label="Two" tone="cyan" />
    </PixelChipGroup>
  </div>
</template>
