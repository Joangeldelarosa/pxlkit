<script setup lang="ts">
import { ref } from 'vue';
import { PixelBareTextarea } from '@pxlkit/ui-kit-vue';

const value = ref('');
</script>

<template>
  <div class="flex flex-col gap-2">
    <PixelBareTextarea v-model="value" placeholder="Type to see live updates" :rows="4" aria-label="Message" />
    <span class="text-xs text-retro-muted">{{ value.length }} chars</span>
  </div>
</template>
