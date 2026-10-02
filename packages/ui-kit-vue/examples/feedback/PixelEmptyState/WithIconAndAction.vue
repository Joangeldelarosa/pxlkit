<script setup lang="ts">
import { PixelButton, PixelEmptyState } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelEmptyState title="No documents" description="Upload a file or create a new document to begin.">
    <template #icon>
      <span
        aria-hidden="true"
        style="width: 32px; height: 32px; border-radius: 4px; border: 2px solid currentColor; display: inline-block"
      />
    </template>
    <template #action>
      <PixelButton size="sm" tone="green" variant="solid">Create document</PixelButton>
    </template>
  </PixelEmptyState>
</template>
