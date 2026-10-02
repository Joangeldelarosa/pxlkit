<script setup lang="ts">
import { PixelToast, type ToastItem } from '@pxlkit/ui-kit-vue';

const toast: ToastItem = {
  id: 't-assertive',
  tone: 'cyan',
  title: 'Important',
  message: 'Forced assertive announcement.',
  assertive: true,
  duration: 0,
};
</script>

<template>
  <PixelToast :toast="toast" />
</template>
