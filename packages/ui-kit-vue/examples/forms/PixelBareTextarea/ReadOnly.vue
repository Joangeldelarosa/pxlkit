<script setup lang="ts">
import { PixelBareTextarea } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBareTextarea readonly default-value="Read-only content for reference" :rows="3" aria-label="Read-only textarea" />
</template>
