<script setup lang="ts">
import { ref } from 'vue';
import { PixelColorInput } from '@pxlkit/ui-kit-vue';

const value = ref('#06b6d4');
</script>

<template>
  <PixelColorInput v-model="value" label="Brand color" />
</template>
