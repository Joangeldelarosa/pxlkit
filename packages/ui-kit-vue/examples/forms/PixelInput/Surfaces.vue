<script setup lang="ts">
import { PixelInput } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-col gap-3">
    <PixelInput label="Pixel" surface="pixel" placeholder="pixel surface" />
    <PixelInput label="Linear" surface="linear" placeholder="linear surface" />
  </div>
</template>
