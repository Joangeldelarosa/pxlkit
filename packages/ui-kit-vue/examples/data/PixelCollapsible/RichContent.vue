<script setup lang="ts">
import { PixelCollapsible } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelCollapsible label="Release notes" tone="cyan" default-open>
    <ul class="list-disc pl-4 text-xs text-retro-muted">
      <li>Added tone-aware chevron header</li>
      <li>Surface-aware typography (pixel vs linear)</li>
      <li>Toggle state preserved on re-render</li>
    </ul>
  </PixelCollapsible>
</template>
