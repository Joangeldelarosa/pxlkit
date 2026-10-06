<script setup lang="ts">
import { ref } from 'vue';
import { PixelButton, PixelModal } from '@pxlkit/ui-kit-vue';

const which = ref<'pixel' | 'linear' | null>(null);
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <PixelButton @click="which = 'pixel'">Pixel surface</PixelButton>
    <PixelButton @click="which = 'linear'">Linear surface</PixelButton>
  </div>
  <PixelModal v-if="which" open :surface="which" :title="`${which} surface`" @close="which = null">
    <p>The {{ which }} surface uses surface-aware borders, dividers, and chrome.</p>
  </PixelModal>
</template>
