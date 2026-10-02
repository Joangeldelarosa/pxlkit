<script setup lang="ts">
import { PixelButton, PxlKitToastProvider } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PxlKitToastProvider v-slot="{ toast }" surface="pixel">
    <div class="flex flex-wrap gap-2">
      <PixelButton
        size="sm"
        @click="toast({ title: 'Pixel surface', message: 'HP-bar accent on the left edge.', tone: 'cyan' })"
      >
        Push pixel toast
      </PixelButton>
    </div>
  </PxlKitToastProvider>
</template>
