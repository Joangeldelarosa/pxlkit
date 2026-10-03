<script setup lang="ts">
import { PixelCard } from '@pxlkit/ui-kit-vue';

function activate() {
  alert('card clicked');
}
</script>

<template>
  <PixelCard
    title="Click me"
    interactive
    description="Press Enter or Space to activate via keyboard."
    @click="activate"
  >
    <p>Renders as role=button with focus ring.</p>
  </PixelCard>
</template>
