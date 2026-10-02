<script setup lang="ts">
import { PixelInputGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelInputGroup aria-label="Phone number with country code">
    <input aria-label="Country code" value="+58" class="bg-transparent px-2 outline-none" style="max-width: 5rem" />
    <input aria-label="Phone number" placeholder="412 555 0123" class="bg-transparent px-2 outline-none" />
  </PixelInputGroup>
</template>
