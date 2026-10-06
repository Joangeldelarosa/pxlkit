<script setup lang="ts">
import { ref } from 'vue';
import { PixelButton, PixelModal } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <PixelButton @click="open = true">Open modal</PixelButton>
  <PixelModal v-model:open="open" title="Default modal">
    <p>This is a minimal modal with title and body content.</p>
  </PixelModal>
</template>
