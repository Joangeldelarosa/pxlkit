<script setup lang="ts">
import { PixelCollapsible } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelCollapsible label="Already expanded" default-open>
    <p class="text-xs text-retro-muted">Renders open on first mount; click the header to collapse.</p>
  </PixelCollapsible>
</template>
