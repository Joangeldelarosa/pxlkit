<script setup lang="ts">
import { PixelRibbon } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap gap-6">
    <div class="relative inline-block border-2 border-retro-border bg-retro-bg/60 p-8 text-retro-text">
      <div>Card content</div>
      <PixelRibbon tone="green">Free</PixelRibbon>
    </div>
    <div class="relative inline-block border-2 border-retro-border bg-retro-bg/60 p-8 text-retro-text">
      <div>Card content</div>
      <PixelRibbon tone="cyan">Beta</PixelRibbon>
    </div>
    <div class="relative inline-block border-2 border-retro-border bg-retro-bg/60 p-8 text-retro-text">
      <div>Card content</div>
      <PixelRibbon tone="purple">Pro</PixelRibbon>
    </div>
  </div>
</template>
