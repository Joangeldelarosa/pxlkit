<script setup lang="ts">
import { ref } from 'vue';
import { PixelButton, PixelModal } from '@pxlkit/ui-kit-vue';

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'full';
const sizes: Size[] = ['sm', 'md', 'lg', 'xl', 'full'];
const size = ref<Size | null>(null);
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <PixelButton v-for="option in sizes" :key="option" size="sm" @click="size = option">{{ option }}</PixelButton>
  </div>
  <PixelModal v-if="size" open :size="size" :title="`Size: ${size}`" @close="size = null">
    <p>Modal rendered at size <code>{{ size }}</code>.</p>
  </PixelModal>
</template>
