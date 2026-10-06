<script setup lang="ts">
import { h } from 'vue';
import { PixelToast, type ToastItem } from '@pxlkit/ui-kit-vue';

const toast: ToastItem = {
  id: 't-icon',
  tone: 'green',
  title: 'Deployed',
  message: 'Build #482 is live.',
  duration: 0,
  icon: () =>
    h('span', {
      'aria-hidden': 'true',
      style: { width: '10px', height: '10px', borderRadius: '9999px', background: 'currentColor', display: 'inline-block' },
    }),
};
</script>

<template>
  <PixelToast :toast="toast" />
</template>
