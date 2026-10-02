<script setup lang="ts">
import { PixelToast, type ToastItem } from '@pxlkit/ui-kit-vue';

const toast: ToastItem = {
  id: 'demo',
  title: 'Saved',
  message: 'Your changes have been persisted.',
  tone: 'cyan',
  duration: 0,
};
</script>

<template>
  <PixelToast :toast="toast" />
</template>
