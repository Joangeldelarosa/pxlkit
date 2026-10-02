<script setup lang="ts">
import { h } from 'vue';
import { PixelButton, PixelToast, type ToastItem } from '@pxlkit/ui-kit-vue';

const toast: ToastItem = {
  id: 't-action',
  tone: 'red',
  title: 'Connection lost',
  message: 'We could not reach the server.',
  duration: 0,
  action: () => h(PixelButton, { size: 'sm', tone: 'red', variant: 'outline' }, () => 'Retry'),
};
</script>

<template>
  <PixelToast :toast="toast" />
</template>
