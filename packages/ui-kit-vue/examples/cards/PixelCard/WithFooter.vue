<script setup lang="ts">
import { PixelCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelCard title="Invoice #1042">
    <p>Total: $1,250.00</p>
    <template #footer>
      <span class="text-xs text-retro-muted">Due in 7 days</span>
    </template>
  </PixelCard>
</template>
