<script setup lang="ts">
import { PixelEmptyState } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelEmptyState title="No projects yet" description="Create your first project to get started organizing your work.">
    <template #icon>
      <span
        aria-hidden="true"
        style="width: 32px; height: 32px; border-radius: 4px; border: 2px solid currentColor; display: inline-block"
      />
    </template>
  </PixelEmptyState>
</template>
