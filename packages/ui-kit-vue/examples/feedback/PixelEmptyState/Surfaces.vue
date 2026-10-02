<script setup lang="ts">
import { PixelEmptyState } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-4">
    <PixelEmptyState surface="linear" title="Linear surface" description="Soft dashed border with rounded corners." />
    <PixelEmptyState surface="pixel" title="Pixel surface" description="Chamfered dashed border with retro typography." />
  </div>
</template>
