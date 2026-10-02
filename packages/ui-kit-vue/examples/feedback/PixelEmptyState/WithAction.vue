<script setup lang="ts">
import { PixelButton, PixelEmptyState } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelEmptyState title="Your inbox is empty" description="When you receive new messages, they will appear here.">
    <template #action>
      <PixelButton size="sm" tone="cyan" variant="solid">Refresh</PixelButton>
    </template>
  </PixelEmptyState>
</template>
