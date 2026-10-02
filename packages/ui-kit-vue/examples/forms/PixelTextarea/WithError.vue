<script setup lang="ts">
import { PixelTextarea } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelTextarea
    label="Feedback"
    default-value=""
    error="Feedback is required."
    placeholder="Tell us what went wrong..."
  />
</template>
