<script setup lang="ts">
import { ref } from 'vue';
import { PixelButton, PixelTooltip } from '@pxlkit/ui-kit-vue';

const open = ref(false);
</script>

<template>
  <div class="flex items-center gap-4">
    <PixelTooltip v-model:open="open" label="Controlled tooltip">
      <PixelButton>Anchor</PixelButton>
    </PixelTooltip>
    <PixelButton tone="cyan" variant="outline" @click="open = !open">{{ open ? 'Hide' : 'Show' }}</PixelButton>
  </div>
</template>
