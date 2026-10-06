<script setup lang="ts">
import { ref } from 'vue';
import { PixelToggle, PixelToggleGroup } from '@pxlkit/ui-kit-vue';

const a = ref('one');
const b = ref('one');
const c = ref('one');
const d = ref('one');
</script>

<template>
  <div class="space-y-3">
    <PixelToggleGroup v-model="a" type="single" variant="soft" aria-label="Soft">
      <PixelToggle value="one">One</PixelToggle>
      <PixelToggle value="two">Two</PixelToggle>
      <PixelToggle value="three">Three</PixelToggle>
    </PixelToggleGroup>
    <PixelToggleGroup v-model="b" type="single" variant="solid" aria-label="Solid">
      <PixelToggle value="one">One</PixelToggle>
      <PixelToggle value="two">Two</PixelToggle>
      <PixelToggle value="three">Three</PixelToggle>
    </PixelToggleGroup>
    <PixelToggleGroup v-model="c" type="single" variant="outline" aria-label="Outline">
      <PixelToggle value="one">One</PixelToggle>
      <PixelToggle value="two">Two</PixelToggle>
      <PixelToggle value="three">Three</PixelToggle>
    </PixelToggleGroup>
    <PixelToggleGroup v-model="d" type="single" variant="ghost" aria-label="Ghost">
      <PixelToggle value="one">One</PixelToggle>
      <PixelToggle value="two">Two</PixelToggle>
      <PixelToggle value="three">Three</PixelToggle>
    </PixelToggleGroup>
  </div>
</template>
