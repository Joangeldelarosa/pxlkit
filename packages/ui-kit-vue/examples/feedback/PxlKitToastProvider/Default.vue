<script setup lang="ts">
import { PixelButton, PxlKitToastProvider } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PxlKitToastProvider v-slot="{ toast }">
    <div class="flex flex-wrap gap-2">
      <PixelButton size="sm" @click="toast({ title: 'Saved', message: 'Your changes were persisted.' })">
        Push toast
      </PixelButton>
    </div>
  </PxlKitToastProvider>
</template>
