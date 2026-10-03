<script setup lang="ts">
import { ref } from 'vue';
import { PixelSlider } from '@pxlkit/ui-kit-vue';

const value = ref(40);
</script>

<template>
  <PixelSlider v-model="value" label="Volume" />
</template>
