<script setup lang="ts">
import { h } from 'vue';
import { PixelButton, PxlKitToastProvider, type UseToastReturn } from '@pxlkit/ui-kit-vue';

function pushDeleted(toast: UseToastReturn['toast']) {
  toast({
    tone: 'red',
    title: 'File deleted',
    message: 'You can still restore it.',
    action: () => h(PixelButton, { size: 'sm', tone: 'red', variant: 'outline' }, () => 'Undo'),
  });
}
</script>

<template>
  <PxlKitToastProvider v-slot="{ toast }">
    <div class="flex flex-wrap gap-2">
      <PixelButton size="sm" tone="red" @click="pushDeleted(toast)">Push with action</PixelButton>
    </div>
  </PxlKitToastProvider>
</template>
