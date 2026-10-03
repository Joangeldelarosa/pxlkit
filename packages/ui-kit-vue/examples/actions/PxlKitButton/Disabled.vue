<script setup lang="ts">
import { PxlKitButton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PxlKitButton label="Disabled" disabled>
    <template #icon>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    </template>
  </PxlKitButton>
</template>
