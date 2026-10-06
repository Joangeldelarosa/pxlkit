<script setup lang="ts">
import { PixelToast, type ToastItem } from '@pxlkit/ui-kit-vue';

const toast: ToastItem = {
  id: 't-loading',
  tone: 'cyan',
  title: 'Uploading…',
  message: 'Hang tight while we sync your files.',
  loading: true,
  duration: 0,
};
</script>

<template>
  <PixelToast :toast="toast" />
</template>
