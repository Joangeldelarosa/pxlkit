<script setup lang="ts">
import { ref } from 'vue';
import { PixelButton, PixelModal } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <PixelButton @click="open = true">Open with custom close label</PixelButton>
  <PixelModal v-model:open="open" title="Localized" close-label="Cerrar">
    <p>The close button announces a custom accessible label.</p>
  </PixelModal>
</template>
