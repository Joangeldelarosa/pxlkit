<script setup lang="ts">
import { ref } from 'vue';
import { PixelInput } from '@pxlkit/ui-kit-vue';

const value = ref('Hello');
</script>

<template>
  <PixelInput v-model="value" label="Bio" :show-count="{ max: 80 }" hint="Keep it short" />
</template>
