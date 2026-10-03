<script setup lang="ts">
import { PixelIconFrame, type ToneKey } from '@pxlkit/ui-kit-vue';

const tones: ToneKey[] = ['neutral', 'cyan', 'green', 'gold', 'red', 'purple', 'pink'];
</script>

<template>
  <div style="display: flex; gap: 12px; flex-wrap: wrap">
    <PixelIconFrame v-for="tone in tones" :key="tone" :tone="tone">
      <template #icon><span style="font-family: monospace; font-weight: 700">&gt;_</span></template>
    </PixelIconFrame>
  </div>
</template>
