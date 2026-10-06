<script setup lang="ts">
import { PixelSection } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelSection :container="false" horizontal-gutter="md" title="Full Width">
    <p class="text-sm text-retro-muted">No centered container; uses page gutters.</p>
  </PixelSection>
</template>
