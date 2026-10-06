<script setup lang="ts">
import { PixelCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelCard
    title="Long Description"
    description="This description is intentionally long to demonstrate the line-clamp behavior. It will be truncated to the configured number of lines with an ellipsis, while maintaining a minimum height so cards stay aligned in a grid."
    :description-lines="2"
  >
    <p>Body still renders below the clamp.</p>
  </PixelCard>
</template>
