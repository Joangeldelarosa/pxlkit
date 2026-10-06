<script setup lang="ts">
import { PixelAlert, PixelButton } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelAlert tone="red" title="Connection lost" message="We couldn't reach the server. Check your network and retry.">
    <template #icon>
      <span
        aria-hidden="true"
        style="width: 14px; height: 14px; border-radius: 9999px; background: currentColor; display: inline-block"
      />
    </template>
    <template #action>
      <PixelButton size="sm" tone="red" variant="outline">Retry</PixelButton>
    </template>
  </PixelAlert>
</template>
