<script setup lang="ts">
import { PixelSectionHeader } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelSectionHeader
    eyebrow="Dashboard"
    title="Recent activity"
    description="What happened across your workspace today."
    title-tone="cyan"
  >
    <template #actions>
      <button type="button">Refresh</button>
      <button type="button">Export</button>
    </template>
  </PixelSectionHeader>
</template>
