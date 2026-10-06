<script setup lang="ts">
import { PixelInputGroup } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelInputGroup aria-label="Website URL">
    <input aria-label="Protocol" value="https://" class="bg-transparent px-2 outline-none" />
    <input aria-label="Domain name" value="pxlkit" class="bg-transparent px-2 outline-none" />
    <input aria-label="Top-level domain" value=".xyz" class="bg-transparent px-2 outline-none" />
  </PixelInputGroup>
</template>
