<script setup lang="ts">
import { ref } from 'vue';
import { PixelToggle, PixelToggleGroup } from '@pxlkit/ui-kit-vue';

const sm = ref('a');
const md = ref('a');
const lg = ref('a');
</script>

<template>
  <div class="space-y-3">
    <PixelToggleGroup v-model="sm" type="single" size="sm" aria-label="Small">
      <PixelToggle value="a">A</PixelToggle>
      <PixelToggle value="b">B</PixelToggle>
      <PixelToggle value="c">C</PixelToggle>
    </PixelToggleGroup>
    <PixelToggleGroup v-model="md" type="single" size="md" aria-label="Medium">
      <PixelToggle value="a">A</PixelToggle>
      <PixelToggle value="b">B</PixelToggle>
      <PixelToggle value="c">C</PixelToggle>
    </PixelToggleGroup>
    <PixelToggleGroup v-model="lg" type="single" size="lg" aria-label="Large">
      <PixelToggle value="a">A</PixelToggle>
      <PixelToggle value="b">B</PixelToggle>
      <PixelToggle value="c">C</PixelToggle>
    </PixelToggleGroup>
  </div>
</template>
