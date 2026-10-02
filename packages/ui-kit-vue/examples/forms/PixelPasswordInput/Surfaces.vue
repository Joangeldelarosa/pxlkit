<script setup lang="ts">
import { PixelPasswordInput } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="space-y-3">
    <PixelPasswordInput label="Pixel surface" surface="pixel" placeholder="Password" />
    <PixelPasswordInput label="Linear surface" surface="linear" placeholder="Password" />
  </div>
</template>
