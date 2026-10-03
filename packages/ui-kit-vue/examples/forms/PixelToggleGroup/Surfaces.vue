<script setup lang="ts">
import { ref } from 'vue';
import { PixelToggle, PixelToggleGroup } from '@pxlkit/ui-kit-vue';

const pixel = ref('one');
const linear = ref('one');
</script>

<template>
  <div class="space-y-3">
    <PixelToggleGroup v-model="pixel" type="single" surface="pixel" aria-label="Pixel surface">
      <PixelToggle value="one">One</PixelToggle>
      <PixelToggle value="two">Two</PixelToggle>
    </PixelToggleGroup>
    <PixelToggleGroup v-model="linear" type="single" surface="linear" aria-label="Linear surface">
      <PixelToggle value="one">One</PixelToggle>
      <PixelToggle value="two">Two</PixelToggle>
    </PixelToggleGroup>
  </div>
</template>
