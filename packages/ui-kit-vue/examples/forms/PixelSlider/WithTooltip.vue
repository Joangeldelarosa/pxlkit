<script setup lang="ts">
import { ref } from 'vue';
import { PixelSlider } from '@pxlkit/ui-kit-vue';

const value = ref(60);
</script>

<template>
  <PixelSlider v-model="value" label="Always tooltip" show-tooltip="always" />
</template>
