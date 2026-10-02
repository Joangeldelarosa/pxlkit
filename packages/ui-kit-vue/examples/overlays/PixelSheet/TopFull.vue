<script setup lang="ts">
import { ref } from 'vue';
import { PixelSheet } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <button type="button" @click="open = true">Open top sheet</button>
  <PixelSheet v-model:open="open" side="top" size="full" aria-label="Top full-screen sheet">
    <p>Top-anchored full-height sheet.</p>
    <button type="button" @click="open = false">Close</button>
  </PixelSheet>
</template>
