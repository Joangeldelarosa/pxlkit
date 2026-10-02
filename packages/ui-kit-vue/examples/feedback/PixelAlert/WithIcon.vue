<script setup lang="ts">
import { PixelAlert } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelAlert tone="cyan" title="Pro tip" message="You can drag-and-drop files anywhere on the page.">
    <template #icon>
      <span
        aria-hidden="true"
        style="width: 14px; height: 14px; border-radius: 9999px; background: currentColor; display: inline-block"
      />
    </template>
  </PixelAlert>
</template>
