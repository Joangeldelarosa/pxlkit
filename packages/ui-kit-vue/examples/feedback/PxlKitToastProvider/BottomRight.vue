<script setup lang="ts">
import { PixelButton, PxlKitToastProvider } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PxlKitToastProvider v-slot="{ toast }" position="bottom-right">
    <div class="flex flex-wrap gap-2">
      <PixelButton size="sm" @click="toast({ title: 'Bottom-right toast' })">Push to bottom-right</PixelButton>
    </div>
  </PxlKitToastProvider>
</template>
