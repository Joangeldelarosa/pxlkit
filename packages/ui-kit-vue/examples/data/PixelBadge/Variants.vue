<script setup lang="ts">
import { PixelBadge } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <PixelBadge variant="soft" tone="green">soft</PixelBadge>
    <PixelBadge variant="solid" tone="green">solid</PixelBadge>
    <PixelBadge variant="outline" tone="green">outline</PixelBadge>
    <PixelBadge variant="ghost" tone="green">ghost</PixelBadge>
  </div>
</template>
