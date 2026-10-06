<script setup lang="ts">
import { PixelToast } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelToast
      surface="linear"
      :toast="{ id: 't-linear', tone: 'cyan', title: 'Linear surface', message: 'Rounded card.', duration: 0 }"
    />
    <PixelToast
      surface="pixel"
      :toast="{ id: 't-pixel', tone: 'cyan', title: 'Pixel surface', message: 'Chamfered + HP bar.', duration: 0 }"
    />
  </div>
</template>
