<script setup lang="ts">
import { PixelStatCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelStatCard label="Small" value="$1,200" size="sm" trend="+2%" tone="cyan" />
    <PixelStatCard label="Medium" value="$8,400" size="md" trend="+5%" tone="gold" />
    <PixelStatCard label="Large" value="$24,900" size="lg" trend="+11%" tone="green" />
  </div>
</template>
