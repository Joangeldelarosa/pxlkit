<script setup lang="ts">
import { PixelCard, PixelCardBody, PixelCardFooter, PixelCardHeader } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelCard title="Composed">
    <PixelCardHeader>
      <span class="text-sm font-semibold">Custom header</span>
    </PixelCardHeader>
    <PixelCardBody>
      <p>Body slot via subcomponent.</p>
    </PixelCardBody>
    <PixelCardFooter>
      <span class="text-xs text-retro-muted">Footer slot</span>
    </PixelCardFooter>
  </PixelCard>
</template>
