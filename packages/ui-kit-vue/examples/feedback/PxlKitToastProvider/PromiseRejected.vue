<script setup lang="ts">
import { PixelButton, PxlKitToastProvider, type UseToastReturn } from '@pxlkit/ui-kit-vue';

function runFailingSave(toast: UseToastReturn['toast']) {
  toast
    .promise(() => new Promise<string>((_resolve, reject) => setTimeout(() => reject(new Error('Network down')), 1000)), {
      loading: { title: 'Saving…' },
      success: { title: 'Saved', message: 'All set.' },
      error: { title: 'Failed', message: 'Try again.' },
    })
    // The error toast tells the user; the rejection needs no other handling.
    .catch(() => {});
}
</script>

<template>
  <PxlKitToastProvider v-slot="{ toast }">
    <div class="flex flex-wrap gap-2">
      <PixelButton size="sm" tone="red" @click="runFailingSave(toast)">Run failing promise</PixelButton>
    </div>
  </PxlKitToastProvider>
</template>
