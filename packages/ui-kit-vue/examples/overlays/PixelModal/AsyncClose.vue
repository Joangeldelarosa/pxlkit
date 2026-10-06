<script setup lang="ts">
import { ref } from 'vue';
import { PixelButton, PixelModal } from '@pxlkit/ui-kit-vue';

const open = ref(false);
const asyncClose = () => new Promise<void>((resolve) => setTimeout(resolve, 800));
</script>

<template>
  <PixelButton @click="open = true">Open async-close</PixelButton>
  <PixelModal v-model:open="open" :async-close="asyncClose" title="Persisting…">
    <p>The close button awaits the asyncClose promise before unmounting.</p>
  </PixelModal>
</template>
