<script setup lang="ts">
import { PixelCheckbox } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="space-y-2">
    <PixelCheckbox label="Disabled unchecked" disabled :checked="false" />
    <PixelCheckbox label="Disabled checked" disabled checked />
  </div>
</template>
