<script setup lang="ts">
import { PixelToast, type ToastItem } from '@pxlkit/ui-kit-vue';

const toasts: ToastItem[] = [
  { id: 't-neutral', tone: 'neutral', title: 'Heads up', message: 'Neutral notification.', duration: 0 },
  { id: 't-green', tone: 'green', title: 'Saved', message: 'Changes synced.', duration: 0 },
  { id: 't-cyan', tone: 'cyan', title: 'Info', message: 'Heads up — new build available.', duration: 0 },
  { id: 't-gold', tone: 'gold', title: 'Warning', message: 'Storage almost full.', duration: 0 },
  { id: 't-red', tone: 'red', title: 'Error', message: 'Upload failed.', duration: 0 },
  { id: 't-purple', tone: 'purple', title: 'Tip', message: 'Press ⌘K to search.', duration: 0 },
  { id: 't-pink', tone: 'pink', title: 'Unlocked', message: 'You earned a badge.', duration: 0 },
];
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelToast v-for="toast in toasts" :key="toast.id" :toast="toast" />
  </div>
</template>
