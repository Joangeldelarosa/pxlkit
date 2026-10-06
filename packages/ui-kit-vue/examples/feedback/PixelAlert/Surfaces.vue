<script setup lang="ts">
import { PixelAlert } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelAlert surface="linear" tone="cyan" title="Linear surface" message="Soft border with rounded corners." />
    <PixelAlert surface="pixel" tone="cyan" title="Pixel surface" message="Chamfered border with a left accent stripe." />
  </div>
</template>
