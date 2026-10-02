<script setup lang="ts">
import { PixelButton, PxlKitToastProvider, type UseToastReturn } from '@pxlkit/ui-kit-vue';

function runSave(toast: UseToastReturn['toast']) {
  return toast.promise(() => new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 1000)), {
    loading: { title: 'Saving…' },
    success: { title: 'Saved', message: 'All set.' },
    error: { title: 'Failed', message: 'Try again.' },
  });
}
</script>

<template>
  <PxlKitToastProvider v-slot="{ toast }">
    <div class="flex flex-wrap gap-2">
      <PixelButton size="sm" @click="runSave(toast)">Run promise</PixelButton>
    </div>
  </PxlKitToastProvider>
</template>
