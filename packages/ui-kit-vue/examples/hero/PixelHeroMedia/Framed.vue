<script setup lang="ts">
import { PixelHeroMedia } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelHeroMedia ratio="16/9" framed tone="cyan" caption="Framed hero with caption">
    <div
      class="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-xs font-mono text-retro-muted"
    >
      16:9 framed
    </div>
  </PixelHeroMedia>
</template>
