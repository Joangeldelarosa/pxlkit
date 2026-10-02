<script setup lang="ts">
import { PixelBareTextarea } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <PixelBareTextarea
    required
    placeholder="This field is required"
    :rows="3"
    aria-label="Required textarea"
    aria-required="true"
  />
</template>
