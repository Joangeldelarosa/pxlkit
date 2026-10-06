<script setup lang="ts">
import { PixelButton, PxlKitToastProvider, type UseToastReturn } from '@pxlkit/ui-kit-vue';

function pushFive(toast: UseToastReturn['toast']) {
  for (let i = 1; i <= 5; i += 1) {
    toast({ title: `Toast ${i}`, message: 'Only the latest two stay.' });
  }
}
</script>

<template>
  <PxlKitToastProvider v-slot="{ toast }" :max="2">
    <div class="flex flex-wrap gap-2">
      <PixelButton size="sm" @click="pushFive(toast)">Push five (max 2)</PixelButton>
    </div>
  </PxlKitToastProvider>
</template>
