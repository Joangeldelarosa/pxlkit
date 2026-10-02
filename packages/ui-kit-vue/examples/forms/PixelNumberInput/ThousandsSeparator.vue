<script setup lang="ts">
import { ref } from 'vue';
import { PixelNumberInput } from '@pxlkit/ui-kit-vue';

const value = ref(1500000);
</script>

<template>
  <PixelNumberInput v-model="value" label="Population" thousands-separator="," :min="0" />
</template>
