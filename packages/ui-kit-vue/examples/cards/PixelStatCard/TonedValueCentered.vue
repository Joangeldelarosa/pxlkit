<script setup lang="ts">
import { PixelStatCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <PixelStatCard label="Uptime" value="99.98%" tone="green" value-tone align="center" />
    <PixelStatCard label="Error rate" value="0.02%" tone="red" value-tone align="center" />
  </div>
</template>
