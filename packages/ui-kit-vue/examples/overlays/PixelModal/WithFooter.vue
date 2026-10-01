<script setup lang="ts">
import { ref } from 'vue';
import { PixelButton, PixelModal } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <PixelButton @click="open = true">Open with footer</PixelButton>
  <PixelModal v-model:open="open" title="Save changes?">
    <p>Footer slot separates actions from body with a surface-aware divider.</p>
    <template #footer>
      <PixelButton variant="ghost" @click="open = false">Cancel</PixelButton>
      <PixelButton tone="cyan" @click="open = false">Save</PixelButton>
    </template>
  </PixelModal>
</template>
