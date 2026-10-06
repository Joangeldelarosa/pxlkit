<script setup lang="ts">
import { PixelToast, type ToastItem } from '@pxlkit/ui-kit-vue';

const toast: ToastItem = {
  id: 't-progress',
  tone: 'green',
  title: 'Auto-dismiss',
  message: 'Hover to pause the countdown bar.',
  duration: 4500,
};
</script>

<template>
  <PixelToast :toast="toast" />
</template>
