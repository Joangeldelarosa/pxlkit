<script setup lang="ts">
import { ref } from 'vue';
import { PixelSlider } from '@pxlkit/ui-kit-vue';

const pixel = ref(40);
const linear = ref(60);
</script>

<template>
  <div class="space-y-4">
    <PixelSlider v-model="pixel" label="Pixel surface" surface="pixel" />
    <PixelSlider v-model="linear" label="Linear surface" surface="linear" />
  </div>
</template>
