<script setup lang="ts">
import { PixelSpinner } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <button type="button" aria-busy="true" class="inline-flex items-center gap-2">
    <PixelSpinner decorative size="sm" />
    <span>Saving…</span>
  </button>
</template>
