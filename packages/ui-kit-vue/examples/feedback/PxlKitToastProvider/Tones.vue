<script setup lang="ts">
import { PixelButton, PxlKitToastProvider } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PxlKitToastProvider v-slot="{ toast }">
    <div class="flex flex-wrap gap-2">
      <PixelButton size="sm" tone="green" @click="toast.success('Saved', 'Changes persisted.')">Success</PixelButton>
      <PixelButton size="sm" tone="cyan" @click="toast.info('Heads up', 'New release available.')">Info</PixelButton>
      <PixelButton size="sm" tone="gold" @click="toast.warning('Careful', 'Storage almost full.')">Warning</PixelButton>
      <PixelButton size="sm" tone="red" @click="toast.error('Failed', 'Upload could not finish.')">Error</PixelButton>
    </div>
  </PxlKitToastProvider>
</template>
