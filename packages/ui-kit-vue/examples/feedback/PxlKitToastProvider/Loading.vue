<script setup lang="ts">
import { PixelButton, PxlKitToastProvider, type UseToastReturn } from '@pxlkit/ui-kit-vue';

function runUpload(toast: UseToastReturn['toast']) {
  const id = toast.loading('Uploading…', 'Hang tight.');
  setTimeout(() => {
    toast.update(id, {
      title: 'Uploaded',
      message: 'File is ready.',
      tone: 'green',
      loading: false,
      duration: 4500,
    });
  }, 1000);
}
</script>

<template>
  <PxlKitToastProvider v-slot="{ toast }">
    <div class="flex flex-wrap gap-2">
      <PixelButton size="sm" @click="runUpload(toast)">Run loading → success</PixelButton>
    </div>
  </PxlKitToastProvider>
</template>
