<script setup lang="ts">
import { PxlKitButton, type Size } from '@pxlkit/ui-kit-vue';

const sizes: { size: Size; label: string }[] = [
  { size: 'sm', label: 'Small' },
  { size: 'md', label: 'Medium' },
  { size: 'lg', label: 'Large' },
];
</script>

<template>
  <div class="flex items-center gap-2">
    <PxlKitButton v-for="item in sizes" :key="item.size" :label="item.label" :size="item.size">
      <template #icon>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </template>
    </PxlKitButton>
  </div>
</template>
