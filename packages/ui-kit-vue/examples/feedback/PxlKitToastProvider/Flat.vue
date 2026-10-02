<script setup lang="ts">
import { PixelButton, PxlKitToastProvider, type UseToastReturn } from '@pxlkit/ui-kit-vue';

function pushThree(toast: UseToastReturn['toast']) {
  toast({ title: 'First', message: 'Oldest of the stack.' });
  toast({ title: 'Second', message: 'In the middle.' });
  toast({ title: 'Third', message: 'Newest in front.' });
}
</script>

<template>
  <PxlKitToastProvider v-slot="{ toast }" :stacked="false">
    <div class="flex flex-wrap gap-2">
      <PixelButton size="sm" @click="pushThree(toast)">Push three</PixelButton>
    </div>
  </PxlKitToastProvider>
</template>
