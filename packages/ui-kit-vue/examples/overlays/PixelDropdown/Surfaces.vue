<script setup lang="ts">
import { PixelDropdown } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="flex flex-wrap items-start gap-4">
    <PixelDropdown
      label="Pixel"
      surface="pixel"
      :items="[
        { value: 'one', label: 'First' },
        { value: 'two', label: 'Second' },
      ]"
    />
    <PixelDropdown
      label="Linear"
      surface="linear"
      :items="[
        { value: 'one', label: 'First' },
        { value: 'two', label: 'Second' },
      ]"
    />
  </div>
</template>
