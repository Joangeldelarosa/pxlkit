<script setup lang="ts">
import { ref } from 'vue';
import { PixelButton, PixelModal } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <PixelButton @click="open = true">Open with description</PixelButton>
  <PixelModal v-model:open="open" title="Confirm action">
    <template #description>This description is wired via aria-describedby for assistive tech.</template>
    <p>Body content sits below the description.</p>
  </PixelModal>
</template>
