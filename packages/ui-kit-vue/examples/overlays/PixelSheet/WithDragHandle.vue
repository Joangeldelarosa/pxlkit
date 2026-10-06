<script setup lang="ts">
import { ref } from 'vue';
import { PixelSheet } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <button type="button" @click="open = true">Open sheet</button>
  <PixelSheet v-model:open="open" size="lg" drag-handle title="Drag handle">
    <p>Bottom sheet with a drag handle affordance.</p>
  </PixelSheet>
</template>
