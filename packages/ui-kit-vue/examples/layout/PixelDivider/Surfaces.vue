<script setup lang="ts">
import { PixelDivider } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-6">
    <PixelDivider label="Pixel surface" surface="pixel" />
    <PixelDivider label="Linear surface" surface="linear" />
  </div>
</template>
